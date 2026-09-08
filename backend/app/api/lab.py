import os
import pty
import fcntl
import termios
import struct
import signal
import asyncio
import json
import logging
import subprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.config import settings

logger = logging.getLogger("studyos.lab")

router = APIRouter()


@router.websocket("/ws")
@router.websocket("/v1/lab/ws")
async def lab_terminal_websocket(websocket: WebSocket):
    """
    Real-time pseudo-terminal (PTY) WebSocket bridge.
    Spawns an interactive bash shell in an isolated session for DevOps labs,
    streaming terminal I/O directly to/from browser xterm.js instances.
    """
    await websocket.accept()

    # Create master/slave pseudo-terminal pair
    master_fd, slave_fd = pty.openpty()

    # Configure custom shell environment
    env = os.environ.copy()
    env["TERM"] = "xterm-256color"
    env["COLORTERM"] = "truecolor"
    env["LANG"] = "en_US.UTF-8"
    env["PS1"] = "\033[01;36mStudyOS-Lab\033[00m:\033[01;34m\\w\033[00m$ "

    # Set default terminal size (80 cols, 24 rows)
    winsize = struct.pack("HHHH", 24, 80, 0, 0)
    fcntl.ioctl(master_fd, termios.TIOCSWINSZ, winsize)

    # Spawn interactive shell
    shell_cmd = ["/bin/bash", "--norc"]
    proc = subprocess.Popen(
        shell_cmd,
        preexec_fn=os.setsid,
        stdin=slave_fd,
        stdout=slave_fd,
        stderr=slave_fd,
        env=env,
        close_fds=True,
    )

    # Close slave in parent; child owns it now
    os.close(slave_fd)

    # Set master non-blocking for asynchronous reads
    flags = fcntl.fcntl(master_fd, fcntl.F_GETFL)
    fcntl.fcntl(master_fd, fcntl.F_SETFL, flags | os.O_NONBLOCK)

    # Send initial welcome banner to client
    welcome_banner = (
        "\r\n\033[1;36m=====================================================\033[0m\r\n"
        f"\033[1;32m  StudyOS v{settings.VERSION} — Autonomous DevOps Lab Shell\033[0m\r\n"
        "\033[0;37m  Connected to sandboxed host environment.\033[0m\r\n"
        "\033[1;36m=====================================================\033[0m\r\n\r\n"
    )
    await websocket.send_text(welcome_banner)

    loop = asyncio.get_event_loop()

    async def read_from_pty():
        """Read output from the PTY and stream to WebSocket."""
        try:
            while proc.poll() is None:
                try:
                    data = os.read(master_fd, 4096)
                    if data:
                        await websocket.send_bytes(data)
                except (BlockingIOError, InterruptedError):
                    await asyncio.sleep(0.02)
                except Exception as exc:
                    logger.debug("PTY read loop exit: %s", exc)
                    break
        except Exception as exc:
            logger.debug("PTY read task terminated: %s", exc)

    async def write_to_pty():
        """Receive keystrokes and resize signals from WebSocket and write to PTY."""
        try:
            while proc.poll() is None:
                msg = await websocket.receive()
                if "bytes" in msg and msg["bytes"]:
                    os.write(master_fd, msg["bytes"])
                elif "text" in msg and msg["text"]:
                    text = msg["text"]
                    # Handle resize control frame: {"type":"resize","cols":100,"rows":30}
                    if text.startswith("{") and "resize" in text:
                        try:
                            ctrl = json.loads(text)
                            if ctrl.get("type") == "resize":
                                cols = int(ctrl.get("cols", 80))
                                rows = int(ctrl.get("rows", 24))
                                fcntl.ioctl(
                                    master_fd,
                                    termios.TIOCSWINSZ,
                                    struct.pack("HHHH", rows, cols, 0, 0),
                                )
                                continue
                        except Exception:
                            pass
                    os.write(master_fd, text.encode("utf-8"))
        except WebSocketDisconnect:
            pass
        except Exception as exc:
            logger.debug("PTY write loop exit: %s", exc)

    read_task = asyncio.create_task(read_from_pty())
    write_task = asyncio.create_task(write_to_pty())

    try:
        # Wait until either read or write completes (or client disconnects)
        done, pending = await asyncio.wait(
            [read_task, write_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for t in pending:
            t.cancel()
    finally:
        # Cleanup: terminate process group & close master file descriptor
        try:
            if proc.poll() is None:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                proc.wait(timeout=1.0)
        except Exception:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
            except Exception:
                pass

        try:
            os.close(master_fd)
        except Exception:
            pass

        try:
            await websocket.close()
        except Exception:
            pass

        logger.info("DevOps Lab PTY session terminated cleanly.")

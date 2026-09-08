import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play, RefreshCw, Cpu, HardDrive } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function DevOpsTerminalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected'
  const [activeTopic, setActiveTopic] = useState('DevOps Shell');
  
  const terminalRef = useRef(null);
  const termInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const initialCmdRef = useRef(null);

  // Listen for global open event
  useEffect(() => {
    const handleLaunch = (e) => {
      if (e.detail) {
        if (e.detail.topic) setActiveTopic(e.detail.topic);
        if (e.detail.command) initialCmdRef.current = e.detail.command;
      }
      setIsOpen(true);
    };

    window.addEventListener('studyos-launch-terminal', handleLaunch);
    return () => window.removeEventListener('studyos-launch-terminal', handleLaunch);
  }, []);

  // Initialize and attach xterm.js when modal opens
  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    // 1. Create Terminal instance with Neumorphic / Glass styling
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Geist Mono", monospace',
      lineHeight: 1.25,
      theme: {
        background: '#0a0e17',
        foreground: '#e2e8f0',
        cursor: '#22d3ee',
        cursorAccent: '#0a0e17',
        selectionBackground: 'rgba(34, 211, 238, 0.3)',
        black: '#1e293b',
        red: '#f43f5e',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#d946ef',
        cyan: '#06b6d4',
        white: '#f8fafc',
        brightBlack: '#475569',
        brightRed: '#fb7185',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#e879f9',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff',
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termInstance.current = term;
    fitAddonRef.current = fitAddon;

    // 2. Connect to WebSocket
    setConnectionStatus('connecting');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const targetHost = host.includes('5173') ? '127.0.0.1:8000' : host;
    const wsUrl = `${wsProtocol}//${targetHost}/api/v1/lab/ws`;

    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    socketRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      // Send terminal resize geometry to backend PTY
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));

      // Dispatch initial command if requested (e.g. from topic card)
      if (initialCmdRef.current) {
        setTimeout(() => {
          ws.send(initialCmdRef.current + '\n');
          initialCmdRef.current = null;
        }, 500);
      }
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const text = new TextDecoder('utf-8').decode(event.data);
        term.write(text);
      } else {
        term.write(event.data);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('disconnected');
      term.write('\r\n\033[31m[WebSocket Connection Error: Check if StudyOS backend is running.]\033[0m\r\n');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    // Forward keystrokes to PTY WebSocket
    const onDataDisposable = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      try {
        fitAddon.fit();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
        }
      } catch {}
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      onDataDisposable.dispose();
      try {
        ws.close();
      } catch {}
      term.dispose();
      termInstance.current = null;
      fitAddonRef.current = null;
      socketRef.current = null;
    };
  }, [isOpen]);

  const sendCommand = (cmd) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(cmd + '\n');
      termInstance.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full flex flex-col rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden transition-all duration-300 ${
          isMaximized ? 'h-[98vh] max-w-[98vw]' : 'h-[80vh] max-w-5xl'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px var(--shadow-dark), inset 1px 1px 2px var(--shadow-light)'
        }}
      >
        {/* Terminal Titlebar (macOS Style) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-input)]/70 select-none">
          {/* Window Traffic Lights */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center text-rose-950 text-[9px] font-black"
              title="Close Terminal"
            >
              ×
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center text-amber-950 text-[9px] font-black"
              title="Toggle Size"
            >
              -
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center text-emerald-950 text-[9px] font-black"
              title="Maximize"
            >
              +
            </button>

            <span className="ml-3 text-xs font-bold text-[color:var(--text-main)] flex items-center gap-2">
              <TerminalIcon size={14} className="text-cyan-400" />
              <span>DevOps Lab: {activeTopic}</span>
            </span>
          </div>

          {/* Quick Preset Commands & Connection Pill */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <button 
                onClick={() => sendCommand('docker ps')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400 text-cyan-300 transition-colors"
              >
                docker ps
              </button>
              <button 
                onClick={() => sendCommand('git status')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400 text-cyan-300 transition-colors"
              >
                git status
              </button>
              <button 
                onClick={() => sendCommand('python3 --version')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400 text-cyan-300 transition-colors"
              >
                python
              </button>
            </div>

            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
              connectionStatus === 'connected' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : connectionStatus === 'connecting'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`} />
              <span>{connectionStatus}</span>
            </span>

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 rounded-lg text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[var(--bg-card)]"
            >
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Terminal Canvas Container */}
        <div className="flex-1 bg-[#0a0e17] p-3 overflow-hidden">
          <div ref={terminalRef} className="w-full h-full" />
        </div>

        {/* Terminal Footer */}
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-input)]/60 flex items-center justify-between text-[11px] text-[color:var(--text-muted)] font-mono">
          <span className="flex items-center gap-2">
            <Cpu size={12} className="text-cyan-400" />
            <span>Pseudo-Terminal: PTY Bridge active</span>
          </span>
          <span className="hidden sm:inline">Ctrl+C / Ctrl+D supported • Host shell attached</span>
        </div>
      </div>
    </div>
  );
}

import uuid
import logging
import concurrent.futures
from typing import Dict, Any, Callable, Optional
from datetime import datetime, timezone
from app.core.config import settings

logger = logging.getLogger("studyos.task_queue")

# Thread pool for non-blocking asynchronous job execution
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4, thread_name_prefix="studyos-worker")

# In-memory registry of task execution status
_task_store: Dict[str, Dict[str, Any]] = {}


class TaskQueue:
    """
    Lightweight, zero-cost asynchronous job processor.
    Dispatches long-running background tasks (PDF text parsing, AI analysis)
    without blocking the primary FastAPI event loop.
    """

    @staticmethod
    def enqueue(task_name: str, func: Callable, *args, **kwargs) -> str:
        task_id = str(uuid.uuid4())
        _task_store[task_id] = {
            "id": task_id,
            "name": task_name,
            "status": "QUEUED",
            "enqueued_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None,
            "error": None,
            "result": None,
        }

        def _worker_wrapper():
            _task_store[task_id]["status"] = "RUNNING"
            logger.info("Executing background task [%s] (%s)", task_id, task_name)
            try:
                result = func(*args, **kwargs)
                _task_store[task_id]["status"] = "COMPLETED"
                _task_store[task_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
                _task_store[task_id]["result"] = result
                logger.info("Task [%s] (%s) completed successfully.", task_id, task_name)
            except Exception as exc:
                _task_store[task_id]["status"] = "FAILED"
                _task_store[task_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
                _task_store[task_id]["error"] = str(exc)
                logger.error("Task [%s] (%s) failed: %s", task_id, task_name, exc, exc_info=True)

        _executor.submit(_worker_wrapper)
        return task_id

    @staticmethod
    def get_status(task_id: str) -> Optional[Dict[str, Any]]:
        return _task_store.get(task_id)


task_queue = TaskQueue()

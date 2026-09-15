import time
from collections import deque
import logging

logger = logging.getLogger(__name__)

class RequestBudgeter:
    """Lightweight sliding window rate limiter to stay under Gemini's 15 RPM free tier."""
    def __init__(self, max_requests_per_minute: int = 14):
        self.max_requests = max_requests_per_minute
        self.requests = deque()
    
    def can_make_request(self) -> bool:
        current_time = time.time()
        # Remove timestamps older than 60 seconds
        while self.requests and current_time - self.requests[0] > 60:
            self.requests.popleft()
        
        return len(self.requests) < self.max_requests
        
    def record_request(self):
        self.requests.append(time.time())
        logger.debug(f"AI Request recorded. Current RPM bucket: {len(self.requests)}")

# Global singleton instance for the app
gemini_budgeter = RequestBudgeter(max_requests_per_minute=14)

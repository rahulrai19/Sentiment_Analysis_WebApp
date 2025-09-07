"""
Performance monitoring middleware for FastAPI
"""
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware to monitor request performance"""
    
    async def dispatch(self, request: Request, call_next):
        # Record start time
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log slow requests (>1 second)
        if process_time > 1.0:
            logger.warning(
                f"Slow request: {request.method} {request.url.path} "
                f"took {process_time:.2f}s"
            )
        
        # Add performance headers
        response.headers["X-Process-Time"] = str(process_time)
        
        # Add cache headers for static content
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "public, max-age=300"  # 5 minutes
        
        return response

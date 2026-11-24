import time
import logging

logger = logging.getLogger(__name__)

class SimpleLoggingMiddleware:
    """
    Lecture 27: Custom Django Middleware.
    Wraps the request-response lifecycle:
    1. Records request method and path (inward phase).
    2. Passes request forward using get_response(request).
    3. Calculates duration and response status code (outward phase).
    4. Attaches custom tracking header to the outgoing response.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Inward phase: before the view
        start_time = time.perf_counter()
        request.course_name = "Django"
        print(f"[Middleware] Incoming Request: {request.method} {request.path}")

        # 2. Forward to next middleware or view
        response = self.get_response(request)

        # 3. Outward phase: after the view returns
        duration_ms = (time.perf_counter() - start_time) * 1000
        print(f"[Middleware] Outgoing Response: {response.status_code} (took {duration_ms:.2f} ms)")

        # 4. Modify response headers
        response["X-Course"] = "Django-Lecture-27"
        response["X-Response-Time-ms"] = f"{duration_ms:.2f}"

        return response

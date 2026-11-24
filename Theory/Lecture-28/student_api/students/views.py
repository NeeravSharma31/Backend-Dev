from django.http import JsonResponse
from .utils import get_external_data

def external_data_view(request, post_id):
    """
    View consuming external service utility with defensive failure protection.
    Returns HTTP 503 Service Unavailable when the external boundary fails.
    """
    result = get_external_data(post_id)
    if result["error"]:
        return JsonResponse(
            {"error": result["error"]},
            status=503
        )
    return JsonResponse(result["data"])

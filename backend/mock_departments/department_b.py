from datetime import datetime


def process_application(data):
    """
    Mock Department B
    Simulates another government department
    with a different system/API.
    """

    return {
        "department": "Department B",
        "received": True,
        "reference_id": "DEPT-B-" + datetime.now().strftime("%H%M%S"),
        "status": "RECEIVED",
        "message": "Application received by Department B",
        "data": data
    }
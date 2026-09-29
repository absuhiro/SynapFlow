from datetime import datetime


def process_application(data):
    """
    Mock Department A
    Simulates an existing government department API.
    """

    return {
        "department": "Department A",
        "received": True,
        "reference_id": "DEPT-A-" + datetime.now().strftime("%H%M%S"),
        "status": "RECEIVED",
        "message": "Application received by Department A",
        "data": data
    }
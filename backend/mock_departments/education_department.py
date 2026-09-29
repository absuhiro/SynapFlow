from datetime import datetime


def process_application(data):
    return {
        "department": "Education Department",
        "received": True,
        "reference_id": "EDU-" + datetime.now().strftime("%H%M%S"),
        "status": "RECEIVED",
        "message": "Application received by Education Department",
        "data": data
    }

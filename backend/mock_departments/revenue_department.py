from datetime import datetime


def process_application(data):
    return {
        "department": "Revenue Department",
        "received": True,
        "reference_id": "REV-" + datetime.now().strftime("%H%M%S"),
        "status": "RECEIVED",
        "message": "Application received by Revenue Department",
        "data": data
    }
    
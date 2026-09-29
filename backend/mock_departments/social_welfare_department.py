from datetime import datetime


def process_application(data):
    return {
        "department": "Social Welfare Department",
        "received": True,
        "reference_id": "SW-" + datetime.now().strftime("%H%M%S"),
        "status": "RECEIVED",
        "message": "Application received by Social Welfare Department",
        "data": data
    }

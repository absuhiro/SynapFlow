from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import sqlite3
import uuid
import json

from synapflow.workflow import SynapFlowWorkflow
from synapflow.document_service import DocumentService


app = FastAPI(title="SynapFlow Core MVP")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


DB = "synapflow.db"


def db():
    connection = sqlite3.connect(DB)
    connection.row_factory = sqlite3.Row
    return connection


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

connection = db()

connection.execute("""
CREATE TABLE IF NOT EXISTS master_applications (
    id TEXT PRIMARY KEY,
    citizen_id TEXT,
    service TEXT,
    status TEXT,
    data TEXT,
    created_at TEXT
)
""")

connection.execute("""
CREATE TABLE IF NOT EXISTS child_applications (
    id TEXT PRIMARY KEY,
    master_id TEXT,
    department TEXT,
    reference_id TEXT,
    status TEXT,
    payload TEXT,
    created_at TEXT
)
""")

connection.execute("""
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    master_id TEXT,
    document_type TEXT,
    file_name TEXT,
    file_path TEXT,
    status TEXT,
    uploaded_at TEXT
)
""")

connection.commit()
connection.close()


# --------------------------------------------------
# MODELS
# --------------------------------------------------

class Application(BaseModel):
    citizen_id: str
    service: str
    name: str
    dob: str
    address: str
    education: str = ""
    family_income: str = ""
    bank_account: str = ""


class Status(BaseModel):
    status: str


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "system": "SynapFlow Core",
        "status": "running"
    }


# --------------------------------------------------
# CREATE MASTER APPLICATION
# --------------------------------------------------

@app.post("/api/applications")
def create_application(application: Application):

    try:
        result = SynapFlowWorkflow.process(
            application.model_dump()
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    master_id = (
        "SF-MASTER-"
        + uuid.uuid4().hex[:8].upper()
    )

    created_at = datetime.now().isoformat()

    connection = db()

    connection.execute(
        """
        INSERT INTO master_applications
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            master_id,
            application.citizen_id,
            result["service"],
            "SUBMITTED",
            json.dumps(application.model_dump()),
            created_at
        )
    )

    child_results = []

    for department_result in result["department_results"]:

        child_id = (
            "SF-CHILD-"
            + uuid.uuid4().hex[:8].upper()
        )

        department_response = (
            department_result["department_response"]
        )

        reference_id = department_response.get(
            "reference_id",
            ""
        )

        connection.execute(
            """
            INSERT INTO child_applications
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                child_id,
                master_id,
                department_result["department"],
                reference_id,
                "SUBMITTED",
                json.dumps(
                    department_result[
                        "normalized_payload"
                    ]
                ),
                created_at
            )
        )

        child_results.append({
            "child_application_id": child_id,
            "department": department_result["department"],
            "reference_id": reference_id,
            "status": "SUBMITTED",
            "department_response": department_response
        })

    connection.commit()
    connection.close()

    return {
        "success": True,
        "master_application_id": master_id,
        "service": result["service"],
        "status": "SUBMITTED",
        "departments": result["departments"],
        "required_fields": result["required_fields"],
        "required_documents": result["required_documents"],
        "workflow": result["workflow"],
        "child_applications": child_results
    }


# --------------------------------------------------
# GET ALL MASTER APPLICATIONS
# --------------------------------------------------

@app.get("/api/applications")
def get_all_applications():

    connection = db()

    masters = connection.execute(
        """
        SELECT *
        FROM master_applications
        ORDER BY created_at DESC
        """
    ).fetchall()

    result = []

    for master in masters:

        children = connection.execute(
            """
            SELECT *
            FROM child_applications
            WHERE master_id = ?
            """,
            (master["id"],)
        ).fetchall()

        master_data = dict(master)

        master_data["data"] = json.loads(
            master_data["data"]
        )

        master_data["child_applications"] = [
            dict(child)
            for child in children
        ]

        result.append(master_data)

    connection.close()

    return result


# --------------------------------------------------
# GET ONE MASTER APPLICATION
# --------------------------------------------------

@app.get("/api/applications/{master_id}")
def get_application(master_id: str):

    connection = db()

    master = connection.execute(
        """
        SELECT *
        FROM master_applications
        WHERE id = ?
        """,
        (master_id,)
    ).fetchone()

    if not master:
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    children = connection.execute(
        """
        SELECT *
        FROM child_applications
        WHERE master_id = ?
        """,
        (master_id,)
    ).fetchall()

    documents = connection.execute(
        """
        SELECT *
        FROM documents
        WHERE master_id = ?
        """,
        (master_id,)
    ).fetchall()

    connection.close()

    return {
        "master_application": dict(master),
        "child_applications": [
            dict(child)
            for child in children
        ],
        "documents": [
            dict(document)
            for document in documents
        ]
    }


# --------------------------------------------------
# UPDATE MASTER STATUS
# --------------------------------------------------

@app.put("/api/applications/{master_id}/status")
def update_application_status(
    master_id: str,
    status: Status
):

    allowed_statuses = [
        "SUBMITTED",
        "UNDER_REVIEW",
        "DOCUMENT_VERIFICATION",
        "APPROVED",
        "REJECTED"
    ]

    if status.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    connection = db()

    cursor = connection.execute(
        """
        UPDATE master_applications
        SET status = ?
        WHERE id = ?
        """,
        (
            status.status,
            master_id
        )
    )

    connection.commit()
    connection.close()

    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return {
        "success": True,
        "master_application_id": master_id,
        "status": status.status
    }


# --------------------------------------------------
# DOCUMENT UPLOAD
# --------------------------------------------------

@app.post("/api/applications/{master_id}/documents")
async def upload_document(
    master_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...)
):

    connection = db()

    application = connection.execute(
        """
        SELECT id
        FROM master_applications
        WHERE id = ?
        """,
        (master_id,)
    ).fetchone()

    if not application:
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    try:
        content = await file.read()

        saved = DocumentService.save_document(
            file.filename,
            content
        )

    except ValueError as e:
        connection.close()

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    document_id = saved["document_id"]

    connection.execute(
        """
        INSERT INTO documents
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            document_id,
            master_id,
            document_type,
            file.filename,
            saved["path"],
            "UPLOADED",
            datetime.now().isoformat()
        )
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "document_id": document_id,
        "master_application_id": master_id,
        "document_type": document_type,
        "file_name": file.filename,
        "status": "UPLOADED"
    }


# --------------------------------------------------
# UPDATE CHILD APPLICATION STATUS
# --------------------------------------------------

@app.put("/api/child-applications/{child_id}/status")
def update_child_status(
    child_id: str,
    status: Status
):

    allowed_statuses = [
        "SUBMITTED",
        "UNDER_REVIEW",
        "DOCUMENT_VERIFICATION",
        "APPROVED",
        "REJECTED",
        "ADDITIONAL_DOCUMENT_REQUIRED"
    ]

    if status.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    connection = db()

    child = connection.execute(
        """
        SELECT *
        FROM child_applications
        WHERE id = ?
        """,
        (child_id,)
    ).fetchone()

    if not child:
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Child application not found"
        )

    connection.execute(
        """
        UPDATE child_applications
        SET status = ?
        WHERE id = ?
        """,
        (
            status.status,
            child_id
        )
    )

    # --------------------------------------------------
    # UPDATE MASTER APPLICATION STATUS
    # --------------------------------------------------

    children = connection.execute(
        """
        SELECT status
        FROM child_applications
        WHERE master_id = ?
        """,
        (child["master_id"],)
    ).fetchall()

    child_statuses = [
        row["status"]
        for row in children
    ]

    master_status = "UNDER_REVIEW"

    if any(
        current_status == "REJECTED"
        for current_status in child_statuses
    ):
        master_status = "REJECTED"

    elif all(
        current_status == "APPROVED"
        for current_status in child_statuses
    ):
        master_status = "APPROVED"

    elif any(
        current_status == "ADDITIONAL_DOCUMENT_REQUIRED"
        for current_status in child_statuses
    ):
        master_status = "DOCUMENT_VERIFICATION"

    elif any(
        current_status == "DOCUMENT_VERIFICATION"
        for current_status in child_statuses
    ):
        master_status = "DOCUMENT_VERIFICATION"

    elif any(
        current_status == "UNDER_REVIEW"
        for current_status in child_statuses
    ):
        master_status = "UNDER_REVIEW"

    elif all(
        current_status == "SUBMITTED"
        for current_status in child_statuses
    ):
        master_status = "SUBMITTED"

    connection.execute(
        """
        UPDATE master_applications
        SET status = ?
        WHERE id = ?
        """,
        (
            master_status,
            child["master_id"]
        )
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "child_application_id": child_id,
        "master_application_id": child["master_id"],
        "child_status": status.status,
        "master_status": master_status
    }
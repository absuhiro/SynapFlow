from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3, uuid
from datetime import datetime

from mock_departments.department_a import process_application as process_department_a
from mock_departments.department_b import process_application as process_department_b

app = FastAPI(title="SynapFlow Core MVP")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB = "synapflow.db"

def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

db().execute('''CREATE TABLE IF NOT EXISTS applications
(id TEXT PRIMARY KEY, citizen_id TEXT, service TEXT, department TEXT,
 status TEXT, data TEXT, created_at TEXT)''')
db().close()

class Application(BaseModel):
    citizen_id: str
    service: str
    name: str
    dob: str
    address: str

class Status(BaseModel):
    status: str

def route(service):
    return "Department A" if service.lower() in ["income certificate", "domicile certificate"] else "Department B"

def transform(x, dept):
    if dept == "Department A":
        return {"applicant_name":x["name"], "birth_date":x["dob"],
                "residential_address":x["address"], "service_code":x["service"]}
    return {"fullName":x["name"], "dateOfBirth":x["dob"],
            "location":x["address"], "requestType":x["service"]}

@app.get("/")
def home():
    return {"system":"SynapFlow Core","status":"running"}

@app.post("/api/applications")
def create(x: Application):
    dept = route(x.service)
    canonical = x.model_dump()
    payload = transform(canonical, dept)
    if dept == "Department A":
        department_response = process_department_a(payload)
    else:
        department_response = process_department_b(payload)
    aid = "SF-" + uuid.uuid4().hex[:8].upper()
    c = db()
    c.execute("INSERT INTO applications VALUES (?,?,?,?,?,?,?)",
              (aid,x.citizen_id,x.service,dept,"UNDER_REVIEW",str(payload),datetime.now().isoformat()))
    c.commit(); c.close()
    return {"success":True,"application_id":aid,"department":dept,
            "status":"UNDER_REVIEW","normalized_payload":payload,"department_response": department_response}

@app.get("/api/applications")
def all_apps():
    c=db(); rows=c.execute("SELECT * FROM applications ORDER BY created_at DESC").fetchall(); c.close()
    return [dict(r) for r in rows]

@app.get("/api/applications/{aid}")
def get_app(aid:str):
    c=db(); r=c.execute("SELECT * FROM applications WHERE id=?",(aid,)).fetchone(); c.close()
    if not r: raise HTTPException(404,"Application not found")
    return dict(r)

@app.put("/api/applications/{aid}/status")
def update(aid:str, x:Status):
    if x.status not in ["UNDER_REVIEW","APPROVED","REJECTED"]:
        raise HTTPException(400,"Invalid status")
    c=db(); cur=c.execute("UPDATE applications SET status=? WHERE id=?",(x.status,aid))
    c.commit(); c.close()
    if cur.rowcount==0: raise HTTPException(404,"Application not found")
    return {"success":True,"application_id":aid,"status":x.status}
import { useEffect, useState } from "react";
import "./index.css";
import Consent from "./pages/consent";
import Login from "./pages/Login";

const API = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [citizen, setCitizen] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationId, setApplicationId] = useState("");
  const [message, setMessage] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [documents, setDocuments] = useState({
    identity_proof: null,
    marksheet: null,
    income_proof: null,
    bank_proof: null,
  });

  const [form, setForm] = useState({
    citizen_id: "C001",
    service: "Income Certificate",
    name: "",
    dob: "",
    address: "",
    education: "",
    family_income: "",
    bank_account: "",
  });

  // --------------------------------------------------
  // LOAD APPLICATIONS
  // --------------------------------------------------

  const loadApplications = async () => {
    try {
      const response = await fetch(`${API}/api/applications`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load applications"
        );
      }

      setApplications(data);
    } catch {
      setMessage("Unable to connect to SynapFlow Core");
    }
  };

  // --------------------------------------------------
  // OPEN APPLICATION DETAIL
  // --------------------------------------------------

  const openApplication = async (id) => {
    try {
      const response = await fetch(
        `${API}/api/applications/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load application"
        );
      }

      setSelectedApplication(data);
      setPage("detail");

    } catch (error) {
      setMessage(error.message);
    }
  };

  // --------------------------------------------------
  // PAGE DATA LOADING
  // --------------------------------------------------

  useEffect(() => {
    if (
      page === "home" ||
      page === "official" ||
      page === "status"
    ) {
      const timer = setTimeout(() => {
        loadApplications();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [page]);

  // --------------------------------------------------
  // SUBMIT APPLICATION
  // --------------------------------------------------

  const submitApplication = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setMessage("Connecting to SynapFlow...");

    try {
      const response = await fetch(
        `${API}/api/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Application failed"
        );
      }

      setApplicationId(
        data.master_application_id
      );

      setMessage(
        "Application submitted. Uploading documents..."
      );

      const documentEntries = Object.entries(
        documents
      );

      for (const [documentType, file] of documentEntries) {

        if (!file) {
          continue;
        }

        const formData = new FormData();

        formData.append(
          "document_type",
          documentType
        );

        formData.append(
          "file",
          file
        );

        const uploadResponse = await fetch(
          `${API}/api/applications/${data.master_application_id}/documents`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {

          const uploadData =
            await uploadResponse.json();

          throw new Error(
            uploadData.detail ||
            `Failed to upload ${documentType}`
          );
        }
      }

      setMessage(
        `Application submitted to ${data.departments.length} departments with documents`
      );

      await loadApplications();

      setPage("status");

    } catch (error) {
      setMessage(error.message);
    }
  };

  // --------------------------------------------------
  // UPDATE MASTER STATUS
  // Kept for backend compatibility.
  // Official processing now uses child status.
  // --------------------------------------------------

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API}/api/applications/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Status update failed"
        );
      }

      await loadApplications();

      setMessage(
        `Application ${status.toLowerCase()}`
      );

    } catch (error) {
      setMessage(error.message);
    }
  };

  // --------------------------------------------------
  // UPDATE CHILD / DEPARTMENT STATUS
  // --------------------------------------------------

  const updateChildStatus = async (
    childId,
    status
  ) => {

    try {

      const response = await fetch(
        `${API}/api/child-applications/${childId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Department status update failed"
        );
      }

      await loadApplications();

      setMessage(
        `Department status updated to ${status.replaceAll(
          "_",
          " "
        )}`
      );

    } catch (error) {
      setMessage(error.message);
    }
  };

  // --------------------------------------------------
  // STATUS CLASS
  // --------------------------------------------------

  const statusClass = (status) => {

    if (status === "APPROVED") {
      return "status approved";
    }

    if (status === "REJECTED") {
      return "status rejected";
    }

    return "status review";
  };

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  if (!loggedIn) {

    return (
      <Login
        onLogin={(user) => {

          setCitizen(user);

          setForm({
            ...form,
            citizen_id: user.citizen_id,
          });

          setLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="app">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="navbar">

        <div
          className="brand"
          onClick={() => setPage("home")}
        >

          <div className="brand-icon">
            S
          </div>

          <div>
            <h2>SynapFlow</h2>
            <span>
              Digital Service Gateway
            </span>
          </div>

        </div>

        <nav>

          <button
            className={
              page === "home"
                ? "nav-active"
                : ""
            }
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            className={
              page === "apply"
                ? "nav-active"
                : ""
            }
            onClick={() => setPage("apply")}
          >
            Services
          </button>

          <button
            className={
              page === "status"
                ? "nav-active"
                : ""
            }
            onClick={() => setPage("status")}
          >
            My Applications
          </button>

          <button
            className="official-nav"
            onClick={() => setPage("official")}
          >
            Official Portal
          </button>

        </nav>

      </header>

      <main>

        {/* ==================================================
            CITIZEN DASHBOARD
        ================================================== */}

        {page === "home" && (

          <section className="dashboard-page">

            <div className="dashboard-header">

              <div>

                <span className="dashboard-eyebrow">
                  CITIZEN DASHBOARD
                </span>

                <h1>
                  Good to see you,{" "}
                  {citizen?.name?.split(" ")[0] ||
                    "Citizen"}.
                </h1>

                <p>
                  Manage your government services
                  from one place.
                </p>

              </div>

              <button
                className="primary-btn"
                onClick={() =>
                  setPage("apply")
                }
              >
                + Start a new service
              </button>

            </div>

            <div className="gateway-banner">

              <div className="gateway-icon">
                S
              </div>

              <div className="gateway-content">

                <span>
                  YOUR SINGLE SERVICE GATEWAY
                </span>

                <h2>
                  One application. SynapFlow
                  handles the connections.
                </h2>

                <p>
                  You don't need to visit multiple
                  departmental portals. Submit your
                  information once and SynapFlow
                  coordinates the required departments.
                </p>

              </div>

              <div className="gateway-stat">
                <strong>1</strong>
                <span>Application</span>
              </div>

              <div className="gateway-arrow">
                →
              </div>

              <div className="gateway-stat">
                <strong>3</strong>
                <span>Departments</span>
              </div>

            </div>

            <div className="dashboard-grid">

              <div className="dashboard-main">

                <div className="dashboard-section-title">

                  <div>
                    <span>YOUR SERVICES</span>
                    <h2>
                      Active applications
                    </h2>
                  </div>

                  <button
                    className="text-btn"
                    onClick={() =>
                      setPage("status")
                    }
                  >
                    View all →
                  </button>

                </div>

                {applications.length === 0 ? (

                  <div className="dashboard-empty">

                    <div className="empty-icon">
                      +
                    </div>

                    <h3>
                      No active applications
                    </h3>

                    <p>
                      Start a government service
                      and track everything from
                      this dashboard.
                    </p>

                    <button
                      className="primary-btn"
                      onClick={() =>
                        setPage("apply")
                      }
                    >
                      Start a service →
                    </button>

                  </div>

                ) : (

                  <div className="dashboard-applications">

                    {applications
                      .slice(0, 3)
                      .map((app) => (

                        <div
                          className="dashboard-application"
                          key={app.id}
                        >

                          <div className="dashboard-application-top">

                            <div className="application-icon">
                              {app.service.charAt(0)}
                            </div>

                            <div>

                              <span className="application-id">
                                {app.id}
                              </span>

                              <h3>
                                {app.service}
                              </h3>

                            </div>

                            <div
                              className={statusClass(
                                app.status
                              )}
                            >
                              {app.status.replaceAll(
                                "_",
                                " "
                              )}
                            </div>

                          </div>

                          <div className="application-departments">

                            {app.child_applications?.map(
                              (child) => (

                                <div
                                  className="mini-department"
                                  key={child.id}
                                >

                                  <span className="department-dot">
                                    ✓
                                  </span>

                                  <span>
                                    {child.department}
                                  </span>

                                  <small>
                                    {child.status.replaceAll(
                                      "_",
                                      " "
                                    )}
                                  </small>

                                </div>

                              )
                            )}

                          </div>

                          <button
                            className="application-track-btn"
                            onClick={() =>
                              openApplication(
                                app.id
                              )
                            }
                          >
                            View application →
                          </button>

                        </div>

                      ))}

                  </div>

                )}

              </div>

              <aside className="dashboard-sidebar">

                <div className="profile-card">

                  <div className="profile-avatar">
                    {citizen?.name?.charAt(0) ||
                      "C"}
                  </div>

                  <div>

                    <span>Citizen</span>

                    <h3>
                      {citizen?.name ||
                        "Citizen"}
                    </h3>

                    <p>
                      ID:{" "}
                      {citizen?.citizen_id ||
                        form.citizen_id}
                    </p>

                  </div>

                </div>

                <div className="action-card">

                  <span>
                    NEED A GOVERNMENT SERVICE?
                  </span>

                  <h3>
                    Start with one application.
                  </h3>

                  <p>
                    Tell us what you need and
                    SynapFlow will identify the
                    departments involved.
                  </p>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setPage("apply")
                    }
                  >
                    Find a service →
                  </button>

                </div>

                <div className="trust-card">

                  <div className="trust-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Consent-controlled sharing
                    </strong>

                    <p>
                      Your information is shared
                      with participating departments
                      only for the selected service.
                    </p>

                  </div>

                </div>

              </aside>

            </div>

            <section className="dashboard-process">

              <div className="dashboard-section-title">

                <div>

                  <span>
                    HOW SYNAPFLOW WORKS
                  </span>

                  <h2>
                    From one request to
                    coordinated processing
                  </h2>

                </div>

              </div>

              <div className="process-grid">

                <div className="process-card">

                  <strong>01</strong>

                  <h3>
                    Tell us what you need
                  </h3>

                  <p>
                    Select a government service
                    and provide your information
                    once.
                  </p>

                </div>

                <div className="process-card">

                  <strong>02</strong>

                  <h3>
                    SynapFlow connects systems
                  </h3>

                  <p>
                    The service registry identifies
                    the departments and requirements
                    involved.
                  </p>

                </div>

                <div className="process-card">

                  <strong>03</strong>

                  <h3>
                    Track everything together
                  </h3>

                  <p>
                    Monitor departmental applications
                    and their status from one place.
                  </p>

                </div>

              </div>

            </section>

          </section>
        )}

        {/* ==================================================
            APPLY
        ================================================== */}

        {page === "apply" && (

          <section className="page-section">

            <div className="page-header">

              <div>

                <span>Citizen Portal</span>

                <h1>
                  Apply for a Service
                </h1>

                <p>
                  Submit your details once.
                  SynapFlow handles departmental
                  routing.
                </p>

              </div>

              <div className="secure-badge">
                🔒 Secure Submission
              </div>

            </div>

            <form
              className="form-card"
              onSubmit={(e) => {
                e.preventDefault();
                setPage("consent");
              }}
            >

              <div className="form-title">

                <h2>
                  Application Details
                </h2>

                <p>
                  Enter the information required
                  for your service.
                </p>

              </div>

              <div className="form-grid">

                <div className="field">

                  <label>
                    Full Name
                  </label>

                  <input
                    required
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field">

                  <label>
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    required
                    value={form.dob}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dob: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field full">

                  <label>
                    Address
                  </label>

                  <input
                    required
                    placeholder="Enter your address"
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field">

                  <label>
                    Education / Qualification
                  </label>

                  <input
                    placeholder="e.g. B.Tech CSE"
                    value={form.education}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        education: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field">

                  <label>
                    Annual Family Income
                  </label>

                  <input
                    placeholder="e.g. 350000"
                    value={form.family_income}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        family_income:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field full">

                  <label>
                    Bank Account
                  </label>

                  <input
                    placeholder="Enter bank account number"
                    value={form.bank_account}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        bank_account:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field full">

                  <label>
                    Service
                  </label>

                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        service: e.target.value,
                      })
                    }
                  >

                    <option>
                      Income Certificate
                    </option>

                    <option>
                      Domicile Certificate
                    </option>

                    <option>
                      Scholarship
                    </option>

                    <option>
                      Other Government Service
                    </option>

                  </select>

                </div>

              </div>

              <div className="document-section">

                <div className="form-title">

                  <h2>
                    Supporting Documents
                  </h2>

                  <p>
                    Upload the documents required
                    for processing your application.
                  </p>

                </div>

                <div className="document-grid">

                  <div className="document-field">

                    <label>
                      Identity Proof
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          identity_proof:
                            e.target.files[0],
                        })
                      }
                    />

                  </div>

                  <div className="document-field">

                    <label>
                      Marksheet
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          marksheet:
                            e.target.files[0],
                        })
                      }
                    />

                  </div>

                  <div className="document-field">

                    <label>
                      Income Proof
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          income_proof:
                            e.target.files[0],
                        })
                      }
                    />

                  </div>

                  <div className="document-field">

                    <label>
                      Bank Proof
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          bank_proof:
                            e.target.files[0],
                        })
                      }
                    />

                  </div>

                </div>

              </div>

              <div className="consent-box">

                <input
                  type="checkbox"
                  required
                />

                <span>
                  I consent to SynapFlow sharing
                  the required information with
                  the relevant government department
                  for processing this application.
                </span>

              </div>

              <button
                className="primary-btn submit-btn"
              >
                Submit Through SynapFlow →
              </button>

              {message && (
                <div className="message">
                  {message}
                </div>
              )}

            </form>

          </section>
        )}

        {/* ==================================================
            CONSENT
        ================================================== */}

        {page === "consent" && (

          <Consent
            form={form}
            onBack={() =>
              setPage("apply")
            }
            onConfirm={submitApplication}
          />

        )}

        {/* ==================================================
            STATUS
        ================================================== */}

        {page === "status" && (

          <section className="page-section">

            <div className="page-header">

              <div>

                <span>Citizen Portal</span>

                <h1>
                  My Applications
                </h1>

                <p>
                  Track applications processed
                  through SynapFlow.
                </p>

              </div>

            </div>

            {applicationId && (

              <div className="success-banner">

                <div className="success-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Application submitted successfully
                  </strong>

                  <p>
                    Your application ID is{" "}
                    <b>{applicationId}</b>
                  </p>

                </div>

              </div>

            )}

            <div className="application-list">

              {applications.length === 0 ? (

                <div className="empty">
                  No applications found.
                </div>

              ) : (

                applications.map((app) => (

                  <div
                    className="application-card"
                    key={app.id}
                  >

                    <div className="application-main">

                      <div className="application-icon">
                        {app.service.charAt(0)}
                      </div>

                      <div>

                        <h3>
                          {app.service}
                        </h3>

                        <p>
                          Master ID: {app.id}
                        </p>

                        <div className="department-list">

                          {app.child_applications?.map(
                            (child) => (

                              <div
                                className="department-item"
                                key={child.id}
                              >

                                <span>
                                  {child.department}
                                </span>

                                <small>
                                  {child.status.replace(
                                    "_",
                                    " "
                                  )}
                                </small>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    </div>

                    <div
                      className={statusClass(
                        app.status
                      )}
                    >
                      {app.status.replace(
                        "_",
                        " "
                      )}
                    </div>

                  </div>

                ))

              )}

            </div>

          </section>
        )}

        {/* ==================================================
            APPLICATION DETAIL
        ================================================== */}

        {page === "detail" &&
          selectedApplication && (

            <section className="page-section">

              <div className="page-header">

                <div>

                  <span>
                    APPLICATION TRACKING
                  </span>

                  <h1>
                    {
                      selectedApplication
                        .master_application
                        .service
                    }
                  </h1>

                  <p>
                    Master Application ID:{" "}
                    <strong>
                      {
                        selectedApplication
                          .master_application
                          .id
                      }
                    </strong>
                  </p>

                </div>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    setPage("home")
                  }
                >
                  ← Dashboard
                </button>

              </div>

              <div className="tracking-overview">

                <div className="tracking-stat">

                  <span>
                    OVERALL STATUS
                  </span>

                  <strong>
                    {
                      selectedApplication
                        .master_application
                        .status.replaceAll(
                          "_",
                          " "
                        )
                    }
                  </strong>

                </div>

                <div className="tracking-stat">

                  <span>
                    DEPARTMENTS
                  </span>

                  <strong>
                    {
                      selectedApplication
                        .child_applications
                        .length
                    }
                  </strong>

                </div>

                <div className="tracking-stat">

                  <span>
                    DOCUMENTS
                  </span>

                  <strong>
                    {
                      selectedApplication
                        .documents
                        .length
                    }
                  </strong>

                </div>

              </div>

              <div className="tracking-section">

                <div className="tracking-heading">

                  <span>
                    DEPARTMENT PROCESSING
                  </span>

                  <h2>
                    Where your application
                    is being processed
                  </h2>

                </div>

                <div className="tracking-departments">

                  {
                    selectedApplication
                      .child_applications
                      .map(
                        (child, index) => (

                          <div
                            className="tracking-department"
                            key={child.id}
                          >

                            <div className="tracking-number">
                              {index + 1}
                            </div>

                            <div className="tracking-department-content">

                              <div className="tracking-department-header">

                                <div>

                                  <h3>
                                    {child.department}
                                  </h3>

                                  <p>
                                    Reference:{" "}
                                    {child.reference_id}
                                  </p>

                                </div>

                                <span
                                  className={statusClass(
                                    child.status
                                  )}
                                >
                                  {child.status.replaceAll(
                                    "_",
                                    " "
                                  )}
                                </span>

                              </div>

                              <div className="tracking-line" />

                              <div className="tracking-meta">

                                <span>
                                  ✓ Application submitted
                                </span>

                                <span>
                                  ✓ Data transformed
                                  for department
                                </span>

                                <span>
                                  ✓ Department system
                                  received request
                                </span>

                              </div>

                            </div>

                          </div>

                        )
                      )
                  }

                </div>

              </div>

              <div className="tracking-section">

                <div className="tracking-heading">

                  <span>
                    DOCUMENTS
                  </span>

                  <h2>
                    Submitted documents
                  </h2>

                </div>

                <div className="tracking-documents">

                  {selectedApplication
                    .documents.length === 0 ? (

                    <div className="tracking-empty">
                      No documents uploaded.
                    </div>

                  ) : (

                    selectedApplication.documents.map(
                      (document) => (

                        <div
                          className="tracking-document"
                          key={document.id}
                        >

                          <div className="document-icon">
                            PDF
                          </div>

                          <div>

                            <strong>
                              {document.file_name}
                            </strong>

                            <span>
                              {document.document_type.replaceAll(
                                "_",
                                " "
                              )}
                            </span>

                          </div>

                          <span className="document-status">
                            {document.status}
                          </span>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

              <div className="tracking-section">

                <div className="tracking-heading">

                  <span>
                    SYNAPFLOW WORKFLOW
                  </span>

                  <h2>
                    Application journey
                  </h2>

                </div>

                <div className="timeline">

                  <div className="timeline-item active">

                    <div className="timeline-dot">
                      ✓
                    </div>

                    <div>

                      <strong>
                        Application submitted
                      </strong>

                      <p>
                        Your unified application
                        was received by SynapFlow.
                      </p>

                    </div>

                  </div>

                  <div className="timeline-item active">

                    <div className="timeline-dot">
                      ✓
                    </div>

                    <div>

                      <strong>
                        Departments identified
                      </strong>

                      <p>
                        SynapFlow determined the
                        participating departments
                        for this service.
                      </p>

                    </div>

                  </div>

                  <div className="timeline-item active">

                    <div className="timeline-dot">
                      ✓
                    </div>

                    <div>

                      <strong>
                        Applications distributed
                      </strong>

                      <p>
                        Department-specific
                        applications were submitted
                        through the interoperability
                        layer.
                      </p>

                    </div>

                  </div>

                  <div className="timeline-item current">

                    <div className="timeline-dot">
                      ●
                    </div>

                    <div>

                      <strong>
                        Department processing
                      </strong>

                      <p>
                        Participating departments
                        are processing the submitted
                        applications.
                      </p>

                    </div>

                  </div>

                  <div className="timeline-item">

                    <div className="timeline-dot">
                      5
                    </div>

                    <div>

                      <strong>
                        Final decision
                      </strong>

                      <p>
                        Final service outcome
                        will appear here.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>

          )}

        {/* ==================================================
            OFFICIAL PORTAL
        ================================================== */}

        {page === "official" && (

          <section className="page-section">

            <div className="page-header">

              <div>

                <span>
                  GOVERNMENT OFFICIAL PORTAL
                </span>

                <h1>
                  Application Processing
                </h1>

                <p>
                  Review departmental applications
                  routed through SynapFlow.
                </p>

              </div>

              <button
                className="secondary-btn"
                onClick={loadApplications}
              >
                ↻ Refresh
              </button>

            </div>

            {/* SUMMARY */}

            <div className="stats-grid">

              <Stat
                title="Master Applications"
                value={applications.length}
              />

              <Stat
                title="Under Review"
                value={
                  applications.filter(
                    (a) =>
                      a.status ===
                      "UNDER_REVIEW"
                  ).length
                }
              />

              <Stat
                title="Approved"
                value={
                  applications.filter(
                    (a) =>
                      a.status ===
                      "APPROVED"
                  ).length
                }
              />

              <Stat
                title="Rejected"
                value={
                  applications.filter(
                    (a) =>
                      a.status ===
                      "REJECTED"
                  ).length
                }
              />

            </div>

            {/* APPLICATIONS */}

            <div className="official-list">

              {applications.length === 0 ? (

                <div className="empty">
                  No applications available.
                </div>

              ) : (

                applications.map((app) => (

                  <div
                    className="official-card"
                    key={app.id}
                  >

                    {/* MASTER INFORMATION */}

                    <div>

                      <div className="application-id">
                        {app.id}
                      </div>

                      <h3>
                        {app.service}
                      </h3>

                      <p>
                        Citizen:{" "}
                        {app.citizen_id}
                      </p>

                      <p>
                        Departments involved:{" "}
                        <b>
                          {app.child_applications
                            ?.length || 0}
                        </b>
                      </p>

                    </div>

                    {/* MASTER STATUS */}

                    <div className="official-actions">

                      <span
                        className={statusClass(
                          app.status
                        )}
                      >
                        {app.status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                    </div>

                    {/* DEPARTMENT PROCESSING */}

                    <div
                      style={{
                        gridColumn:
                          "1 / -1",
                        width: "100%",
                        marginTop:
                          "12px",
                        paddingTop:
                          "18px",
                        borderTop:
                          "1px solid #eaecf0",
                      }}
                    >

                      <strong
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#475467",
                        }}
                      >
                        DEPARTMENT PROCESSING
                      </strong>

                      <div
                        style={{
                          marginTop:
                            "12px",
                          display:
                            "grid",
                          gap:
                            "10px",
                        }}
                      >

                        {app.child_applications?.map(
                          (child) => (

                            <div
                              key={child.id}
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                                gap:
                                  "15px",
                                padding:
                                  "14px",
                                background:
                                  "#f8fafc",
                                border:
                                  "1px solid #eaecf0",
                                borderRadius:
                                  "9px",
                              }}
                            >

                              {/* DEPARTMENT */}

                              <div>

                                <strong
                                  style={{
                                    display:
                                      "block",
                                    color:
                                      "#101828",
                                    fontSize:
                                      "13px",
                                  }}
                                >
                                  {child.department}
                                </strong>

                                <span
                                  style={{
                                    display:
                                      "block",
                                    marginTop:
                                      "4px",
                                    color:
                                      "#667085",
                                    fontSize:
                                      "10px",
                                  }}
                                >
                                  Reference:{" "}
                                  {child.reference_id}
                                </span>

                              </div>

                              {/* STATUS */}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "10px",
                                  flexWrap:
                                    "wrap",
                                  justifyContent:
                                    "flex-end",
                                }}
                              >

                                <span
                                  className={statusClass(
                                    child.status
                                  )}
                                >
                                  {child.status.replaceAll(
                                    "_",
                                    " "
                                  )}
                                </span>

                                {/* PROCESS BUTTONS */}

                                {child.status !==
                                  "APPROVED" &&
                                  child.status !==
                                    "REJECTED" && (

                                    <div
                                      className="action-buttons"
                                    >

                                      <button
                                        className="approve-btn"
                                        onClick={() =>
                                          updateChildStatus(
                                            child.id,
                                            "APPROVED"
                                          )
                                        }
                                      >
                                        ✓ Approve
                                      </button>

                                      <button
                                        className="reject-btn"
                                        onClick={() =>
                                          updateChildStatus(
                                            child.id,
                                            "REJECTED"
                                          )
                                        }
                                      >
                                        ✕ Reject
                                      </button>

                                    </div>

                                  )}

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                ))

              )}

            </div>

            {message && (

              <div className="message">
                {message}
              </div>

            )}

          </section>

        )}

      </main>

      <footer>

        <strong>
          SynapFlow
        </strong>

        <span>
          Interoperability layer for connected
          government services
        </span>

        <span>
          SIH 2026 · TechNova · VGUJ
        </span>

      </footer>

    </div>
  );
}


/* ==================================================
   COMPONENTS
================================================== */

function Stat({
  title,
  value
}) {

  return (

    <div className="stat-card">

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );
}


export default App;
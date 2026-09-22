import { useEffect, useState } from "react";
import "./index.css";
import Consent from "./pages/consent";

const API = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("home");
  const [applications, setApplications] = useState([]);
  const [applicationId, setApplicationId] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    citizen_id: "C001",
    service: "Income Certificate",
    name: "",
    dob: "",
    address: "",
  });

  const loadApplications = async () => {
    try {
      const response = await fetch(`${API}/api/applications`);
      const data = await response.json();
      setApplications(data);
    } catch {
      setMessage("Unable to connect to SynapFlow Core");
    }
  };

  useEffect(() => {
    if (page === "official" || page === "status") {
      loadApplications();
    }
  }, [page]);

  const submitApplication = async (e) => {
    if(e) {
      e.preventDefault();
    }
    
    setMessage("Connecting to SynapFlow...");

    try {
      const response = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Application failed");
      }

      setApplicationId(data.application_id);
      setMessage(`Successfully routed to ${data.department}`);
      await loadApplications();
      setPage("status");
    } catch (error) {
      setMessage(error.message);
    }
  };

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

      if (!response.ok) {
        throw new Error("Status update failed");
      }

      await loadApplications();
      setMessage(`Application ${status.toLowerCase()}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const statusClass = (status) => {
    if (status === "APPROVED") return "status approved";
    if (status === "REJECTED") return "status rejected";
    return "status review";
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <div
          className="brand"
          onClick={() => setPage("home")}
        >
          <div className="brand-icon">S</div>
          <div>
            <h2>SynapFlow</h2>
            <span>Digital Service Gateway</span>
          </div>
        </div>

        <nav>
          <button
            className={page === "home" ? "nav-active" : ""}
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            className={page === "apply" ? "nav-active" : ""}
            onClick={() => setPage("apply")}
          >
            Services
          </button>

          <button
            className={page === "status" ? "nav-active" : ""}
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

        {/* HOME */}
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <div className="eyebrow">
                  INTEROPERABILITY PLATFORM
                </div>

                <h1>
                  One gateway.
                  <br />
                  <span>Connected government services.</span>
                </h1>

                <p>
                  SynapFlow connects existing departmental systems
                  through a secure interoperability layer, giving
                  citizens one simple journey across multiple services.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-btn"
                    onClick={() => setPage("apply")}
                  >
                    Explore Services →
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => setPage("status")}
                  >
                    Track Application
                  </button>
                </div>
              </div>

              <div className="hero-visual">
                <div className="core-card">
                  <div className="core-label">SYNAPFLOW CORE</div>

                  <div className="core-circle">
                    <strong>S</strong>
                    <span>INTEROPERABILITY</span>
                  </div>

                  <div className="connection connection-1">
                    Citizen
                  </div>

                  <div className="connection connection-2">
                    Dept. A
                  </div>

                  <div className="connection connection-3">
                    Dept. B
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <span>AVAILABLE SERVICES</span>
                <h2>Access services through one gateway</h2>
              </div>

              <div className="service-grid">

                <ServiceCard
                  icon="₹"
                  title="Income Certificate"
                  description="Apply and track your income certificate."
                  onClick={() => {
                    setForm({
                      ...form,
                      service: "Income Certificate",
                    });
                    setPage("apply");
                  }}
                />

                <ServiceCard
                  icon="⌂"
                  title="Domicile Certificate"
                  description="Submit a domicile certificate application."
                  onClick={() => {
                    setForm({
                      ...form,
                      service: "Domicile Certificate",
                    });
                    setPage("apply");
                  }}
                />

                <ServiceCard
                  icon="🎓"
                  title="Scholarship"
                  description="Submit scholarship-related applications."
                  onClick={() => {
                    setForm({
                      ...form,
                      service: "Scholarship",
                    });
                    setPage("apply");
                  }}
                />

              </div>
            </section>

            <section className="workflow-section">
              <div className="section-heading">
                <span>HOW IT WORKS</span>
                <h2>From application to service delivery</h2>
              </div>

              <div className="workflow">

                <WorkflowStep
                  number="01"
                  title="Apply"
                  text="Citizen submits one application."
                />

                <div className="workflow-line" />

                <WorkflowStep
                  number="02"
                  title="Connect"
                  text="SynapFlow identifies the required department."
                />

                <div className="workflow-line" />

                <WorkflowStep
                  number="03"
                  title="Exchange"
                  text="Data is normalized and securely exchanged."
                />

                <div className="workflow-line" />

                <WorkflowStep
                  number="04"
                  title="Track"
                  text="Citizen receives transparent status updates."
                />

              </div>
            </section>
          </>
        )}

        {/* APPLY */}
        {page === "apply" && (
          <section className="page-section">

            <div className="page-header">
              <div>
                <span>Citizen Portal</span>
                <h1>Apply for a Service</h1>
                <p>
                  Submit your details once. SynapFlow handles
                  departmental routing.
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
                <h2>Application Details</h2>
                <p>Enter the information required for your service.</p>
              </div>

              <div className="form-grid">

                <div className="field">
                  <label>Full Name</label>
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
                  <label>Date of Birth</label>
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
                  <label>Address</label>
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

                <div className="field full">
                  <label>Service</label>
                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        service: e.target.value,
                      })
                    }
                  >
                    <option>Income Certificate</option>
                    <option>Domicile Certificate</option>
                    <option>Scholarship</option>
                    <option>Other Government Service</option>
                  </select>
                </div>

              </div>

              <div className="consent-box">
                <input type="checkbox" required />

                <span>
                  I consent to SynapFlow sharing the required
                  information with the relevant government
                  department for processing this application.
                </span>
              </div>

              <button className="primary-btn submit-btn">
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

        {page === "consent" && (
          <Consent
            form={form}
            onBack={() => setPage("apply")}
            onConfirm={submitApplication}
          />
        )}

        {/* STATUS */}
        {page === "status" && (
          <section className="page-section">

            <div className="page-header">
              <div>
                <span>Citizen Portal</span>
                <h1>My Applications</h1>
                <p>
                  Track applications processed through SynapFlow.
                </p>
              </div>
            </div>

            {applicationId && (
              <div className="success-banner">
                <div className="success-icon">✓</div>

                <div>
                  <strong>Application submitted successfully</strong>
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
                        <h3>{app.service}</h3>
                        <p>
                          {app.id} · {app.department}
                        </p>
                      </div>

                    </div>

                    <div className={statusClass(app.status)}>
                      {app.status.replace("_", " ")}
                    </div>
                  </div>
                ))
              )}

            </div>
          </section>
        )}

        {/* OFFICIAL */}
        {page === "official" && (
          <section className="page-section">

            <div className="page-header">
              <div>
                <span>Government Official Portal</span>
                <h1>Application Dashboard</h1>
                <p>
                  Review and process applications routed through
                  SynapFlow.
                </p>
              </div>

              <button
                className="secondary-btn"
                onClick={loadApplications}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="stats-grid">

              <Stat
                title="Total Applications"
                value={applications.length}
              />

              <Stat
                title="Under Review"
                value={
                  applications.filter(
                    (a) => a.status === "UNDER_REVIEW"
                  ).length
                }
              />

              <Stat
                title="Approved"
                value={
                  applications.filter(
                    (a) => a.status === "APPROVED"
                  ).length
                }
              />

              <Stat
                title="Rejected"
                value={
                  applications.filter(
                    (a) => a.status === "REJECTED"
                  ).length
                }
              />

            </div>

            <div className="official-list">

              {applications.map((app) => (
                <div
                  className="official-card"
                  key={app.id}
                >

                  <div>
                    <div className="application-id">
                      {app.id}
                    </div>

                    <h3>{app.service}</h3>

                    <p>
                      Citizen: {app.citizen_id}
                    </p>

                    <p>
                      Routed to: <b>{app.department}</b>
                    </p>
                  </div>

                  <div className="official-actions">

                    <div className={statusClass(app.status)}>
                      {app.status.replace("_", " ")}
                    </div>

                    {app.status === "UNDER_REVIEW" && (
                      <div className="action-buttons">

                        <button
                          className="approve-btn"
                          onClick={() =>
                            updateStatus(
                              app.id,
                              "APPROVED"
                            )
                          }
                        >
                          ✓ Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            updateStatus(
                              app.id,
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
              ))}

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
        <strong>SynapFlow</strong>
        <span>Interoperability layer for connected government services</span>
        <span>SIH 2026 · TechNova · VGUJ</span>
      </footer>

    </div>
  );
}

/* COMPONENTS */

function ServiceCard({ icon, title, description, onClick }) {
  return (
    <div className="service-card">

      <div className="service-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button onClick={onClick}>
        Apply →
      </button>

    </div>
  );
}

function WorkflowStep({ number, title, text }) {
  return (
    <div className="workflow-step">

      <div className="step-number">
        {number}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
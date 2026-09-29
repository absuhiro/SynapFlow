import { useState } from "react";

function Login({ onLogin }) {
  const [loginType, setLoginType] = useState("citizen");

  const [citizenId, setCitizenId] = useState("");
  const [officialId, setOfficialId] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(
    "Education Department"
  );

  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (loginType === "citizen") {

      if (!citizenId || !password) {
        setError(
          "Please enter your Citizen ID and password."
        );
        return;
      }

      onLogin({
        role: "citizen",
        citizen_id: citizenId,
        name: "Harveer Singh",
      });

      return;
    }

    if (!officialId || !password) {
      setError(
        "Please enter your Official ID and password."
      );
      return;
    }

    onLogin({
      role: "official",
      official_id: officialId,
      name: "Government Official",
      department: department,
    });
  };

  const switchLoginType = (type) => {
    setLoginType(type);
    setError("");
    setPassword("");
  };

  return (
    <div className="login-page">

      {/* ==================================================
          LEFT VISUAL PANEL
      ================================================== */}

      <div className="login-visual">

        <div className="login-brand">

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

        <div className="login-message">

          <span>
            ONE PLATFORM. CONNECTED GOVERNMENT.
          </span>

          <h1>
            Government services,
            <br />
            <strong>
              without the runaround.
            </strong>
          </h1>

          <p>
            SynapFlow connects citizens with
            multiple government departments
            through one coordinated service
            gateway.
          </p>

        </div>

        <div className="login-flow">

          <div className="login-flow-item">

            <strong>01</strong>

            <span>
              One application
            </span>

          </div>

          <div className="login-flow-line" />

          <div className="login-flow-item">

            <strong>02</strong>

            <span>
              Multiple departments
            </span>

          </div>

          <div className="login-flow-line" />

          <div className="login-flow-item">

            <strong>03</strong>

            <span>
              One tracking view
            </span>

          </div>

        </div>

      </div>


      {/* ==================================================
          LOGIN PANEL
      ================================================== */}

      <div className="login-panel">

        <div className="login-card">

          <div className="mobile-login-brand">

            <div className="brand-icon">
              S
            </div>

            <strong>
              SynapFlow
            </strong>

          </div>


          {/* LOGIN TYPE SWITCH */}

          <div className="login-switch">

            <button
              type="button"
              className={
                loginType === "citizen"
                  ? "login-switch-active"
                  : ""
              }
              onClick={() =>
                switchLoginType("citizen")
              }
            >
              Citizen
            </button>

            <button
              type="button"
              className={
                loginType === "official"
                  ? "login-switch-active"
                  : ""
              }
              onClick={() =>
                switchLoginType("official")
              }
            >
              Government Official
            </button>

          </div>


          {/* ==================================================
              CITIZEN LOGIN
          ================================================== */}

          {loginType === "citizen" && (

            <>
              <span className="login-label">
                CITIZEN PORTAL
              </span>

              <h1>
                Welcome back
              </h1>

              <p className="login-subtitle">
                Sign in to access your government
                services and applications.
              </p>
            </>

          )}


          {/* ==================================================
              OFFICIAL LOGIN
          ================================================== */}

          {loginType === "official" && (

            <>
              <span className="login-label">
                GOVERNMENT OFFICIAL PORTAL
              </span>

              <h1>
                Official sign in
              </h1>

              <p className="login-subtitle">
                Sign in to process applications
                routed to your department.
              </p>
            </>

          )}


          <form onSubmit={handleLogin}>

            {/* CITIZEN ID */}

            {loginType === "citizen" && (

              <div className="login-field">

                <label>
                  Citizen ID
                </label>

                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) =>
                    setCitizenId(
                      e.target.value
                    )
                  }
                  placeholder="Enter your Citizen ID"
                />

              </div>

            )}


            {/* OFFICIAL ID */}

            {loginType === "official" && (

              <div className="login-field">

                <label>
                  Official ID
                </label>

                <input
                  type="text"
                  value={officialId}
                  onChange={(e) =>
                    setOfficialId(
                      e.target.value
                    )
                  }
                  placeholder="Enter your Official ID"
                />

              </div>

            )}


            {/* DEPARTMENT */}

            {loginType === "official" && (

              <div className="login-field">

                <label>
                  Department
                </label>

                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(
                      e.target.value
                    )
                  }
                >

                  <option>
                    Education Department
                  </option>

                  <option>
                    Revenue Department
                  </option>

                  <option>
                    Social Welfare Department
                  </option>

                </select>

              </div>

            )}


            {/* PASSWORD */}

            <div className="login-field">

              <label>
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
              />

            </div>


            {/* ERROR */}

            {error && (

              <div className="login-error">
                {error}
              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="primary-btn login-btn"
            >

              {loginType === "citizen"
                ? "Sign in securely →"
                : "Access Official Portal →"}

            </button>

          </form>


          {/* SECURITY CARD */}

          <div className="login-security">

            <span>
              🔒
            </span>

            <div>

              <strong>
                {loginType === "citizen"
                  ? "Secure citizen access"
                  : "Authorized official access"}
              </strong>

              <p>

                {loginType === "citizen"
                  ? "Your information is shared only with authorized services during processing."
                  : "Department officials can process applications routed to their authorized department."}

              </p>

            </div>

          </div>


          {/* DEMO NOTE */}

          <p className="login-demo">

            Prototype demo · Authentication
            and RBAC will be connected to the
            backend

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
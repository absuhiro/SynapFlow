function Consent({ form, onConfirm, onBack }) {
  return (
    <div className="page-section">

      <div className="page-header">
        <div>
          <span>DATA CONSENT</span>
          <h1>Review & Give Consent</h1>
          <p>
            SynapFlow will securely share the required information
            with the relevant department.
          </p>
        </div>

        <div className="secure-badge">
          🔒 Consent Controlled
        </div>
      </div>

      <div className="form-card">

        <div className="form-title">
          <h2>Information to be shared</h2>
          <p>
            Please review the information before continuing.
          </p>
        </div>

        <div className="consent-details">

          <div>
            <span>Citizen : </span>
            <strong>{form.name || "Not provided"}</strong>
          </div>

          <div>
            <span>Service : </span>
            <strong>{form.service}</strong>
          </div>

          <div>
            <span>Date of Birth : </span>
            <strong>{form.dob || "Not provided"}</strong>
          </div>

          <div>
            <span>Address : </span>
            <strong>{form.address || "Not provided"}</strong>
          </div>

        </div>

        <div className="consent-box">
          <input type="checkbox" id="consent" />

          <label htmlFor="consent">
            I authorize SynapFlow to share the required information
            with the relevant government department for processing
            this service request.
          </label>
        </div>

        <div className="hero-actions">

          <button
            className="secondary-btn"
            onClick={onBack}
          >
            ← Go Back
          </button>

          <button
            className="primary-btn"
            onClick={() => {
              const checkbox =
                document.getElementById("consent");

              if (!checkbox.checked) {
                alert("Please provide consent to continue.");
                return;
              }

              onConfirm();
            }}
          >
            Give Consent & Continue →
          </button>

        </div>

      </div>

    </div>
  );
}

export default Consent;
import { useState } from "react";

function Consent({ form, onConfirm, onBack }) {
  const [consent, setConsent] = useState(false);

  const handleContinue = () => {
    if (!consent) {
      alert("Please provide consent to continue.");
      return;
    }

    onConfirm();
  };

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

          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />

          <span>
            I authorize SynapFlow to share the required information
            with the relevant government department for processing
            this service request.
          </span>

        </div>

        <div className="hero-actions">

          <button
            type="button"
            className="secondary-btn"
            onClick={onBack}
          >
            ← Go Back
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={handleContinue}
          >
            Give Consent & Continue →
          </button>

        </div>

      </div>

    </div>
  );
}

export default Consent;
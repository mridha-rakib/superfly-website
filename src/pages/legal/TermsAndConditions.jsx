import React from "react";
import LegalContentView from "../../components/legal/LegalContentView";

function TermsAndConditions() {
  return (
    <LegalContentView
      slug="terms-and-conditions"
      eyebrow="Terms"
      fallbackTitle="Terms and Conditions"
      intro="These terms outline the rules, expectations, and responsibilities tied to using the Superfly Services website and submitting quotes or bookings through the platform."
    />
  );
}

export default TermsAndConditions;

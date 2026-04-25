import React from "react";
import LegalContentView from "../../components/legal/LegalContentView";

function PrivacyPolicy() {
  return (
    <LegalContentView
      slug="privacy-policy"
      eyebrow="Privacy"
      fallbackTitle="Privacy Policy"
      intro="This page explains what information Superfly Services collects, how that information is used, and how we handle your data when you request quotes, schedule services, and communicate with our team."
    />
  );
}

export default PrivacyPolicy;

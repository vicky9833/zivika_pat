"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ZivikaLogo from "@/components/shared/ZivikaLogo";

const H = "Outfit, var(--font-outfit, sans-serif)";
const B = "DM Sans, var(--font-dm-sans, sans-serif)";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: H,
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#0D6E4F",
          margin: "0 0 12px",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: B,
          fontSize: "0.9rem",
          color: "#5A7A6E",
          lineHeight: 1.75,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Para({ children }) {
  return <p style={{ margin: "0 0 12px" }}>{children}</p>;
}

function UL({ items }) {
  return (
    <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F0F7F4",
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(240,247,244,0.95)",
          backdropFilter: "blur(12px)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #DCE8E2",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#5A7A6E",
            fontFamily: B,
            fontSize: "0.9rem",
            padding: 0,
          }}
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <ZivikaLogo size={28} showText />
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "32px 20px 80px",
        }}
      >
        <h1
          style={{
            fontFamily: H,
            fontWeight: 800,
            fontSize: "1.8rem",
            color: "#0B1F18",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Terms of Service
        </h1>
        <p
          style={{
            fontFamily: B,
            fontSize: "0.85rem",
            color: "#8EBAA3",
            margin: "0 0 36px",
          }}
        >
          Last updated: April 22, 2026 &nbsp;·&nbsp; Zivika Labs Pvt Ltd
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "28px 24px",
            border: "1px solid #DCE8E2",
          }}
        >
          <Section title="1. Agreement to Terms">
            <Para>
              By accessing or using Zivika — the personal health management app operated
              by Zivika Labs Pvt Ltd — you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the service.
            </Para>
            <Para>
              These terms apply to all users of the Zivika app, including users who are
              patients, caregivers, or family members using the service to manage health
              records.
            </Para>
          </Section>

          <Section title="2. Health Information Disclaimer">
            <Para>
              <strong style={{ color: "#0D6E4F" }}>
                Zivika is not a medical device and does not provide medical advice.
              </strong>
            </Para>
            <UL
              items={[
                "Information and AI-generated insights provided by Zivika are for informational and organisational purposes only.",
                "Always consult a qualified and registered healthcare professional for any medical condition, diagnosis, or treatment decision.",
                "Do not rely on Zivika for medical emergencies. Call 112 (India Emergency) or visit your nearest hospital immediately.",
                "Zivika's AI copilot is an information tool — it is not a substitute for professional medical judgment.",
                "Information provided about medications is general in nature and should be verified with a pharmacist or doctor.",
              ]}
            />
          </Section>

          <Section title="3. User Accounts and Data">
            <Para>
              <strong>What data we collect:</strong> When you create an account and use
              Zivika, we collect your name, email address, health profile information
              (age, gender, blood group, conditions), health records you upload, vitals
              you log, medications you track, and family member information you add.
            </Para>
            <Para>
              <strong>How we store it:</strong> Your data is stored on Convex Cloud
              infrastructure with encryption at rest and in transit. Health records
              (images, documents) are stored using Convex File Storage with access
              control. Authentication is managed by Clerk, a SOC 2 Type II certified
              identity provider.
            </Para>
            <Para>
              <strong>Your right to delete data:</strong> You may request deletion of
              your account and all associated data at any time by contacting{" "}
              <a
                href="mailto:support@zivikalabs.com"
                style={{ color: "#0D6E4F", textDecoration: "underline" }}
              >
                support@zivikalabs.com
              </a>
              . We will process the request within 30 days as required by applicable law.
            </Para>
          </Section>

          <Section title="4. Prohibited Uses">
            <Para>You agree not to use Zivika for:</Para>
            <UL
              items={[
                "Attempting to diagnose, treat, cure, or prevent any disease solely based on Zivika's output.",
                "Using Zivika as a replacement for professional medical advice, diagnosis, or treatment.",
                "Uploading content that violates applicable laws, including content you do not own or have rights to.",
                "Attempting to reverse-engineer, scrape, or extract data from the platform.",
                "Sharing your account credentials with others or impersonating another person.",
                "Using the platform to store or transmit malicious code.",
              ]}
            />
          </Section>

          <Section title="5. Privacy and DPDP Act 2023 Compliance">
            <Para>
              Zivika Labs complies with India&apos;s{" "}
              <strong>Digital Personal Data Protection Act 2023 (DPDP Act)</strong>.
            </Para>
            <UL
              items={[
                "We collect only the data necessary to provide the health management service.",
                "Data is stored within Convex Cloud infrastructure. We are working to ensure data residency in India.",
                "We do not sell, rent, or trade your personal health data to any third party.",
                "You have the right to access, correct, and erase your personal data.",
                "We will notify you in the event of a data breach as required by applicable law.",
                "You may nominate a trusted person to manage your data in the event of your incapacity.",
              ]}
            />
            <Para>
              For the full Privacy Policy, see our{" "}
              <a
                href="/privacy"
                style={{ color: "#0D6E4F", textDecoration: "underline" }}
              >
                Privacy Policy page
              </a>
              .
            </Para>
          </Section>

          <Section title="6. Limitation of Liability">
            <Para>
              To the maximum extent permitted by applicable Indian law, Zivika Labs Pvt
              Ltd shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages — including, without limitation, loss of health outcomes,
              loss of data, or any damages resulting from health decisions made based on
              information provided by Zivika.
            </Para>
            <Para>
              Zivika Labs&apos; aggregate liability for any claims arising out of or
              relating to the service shall not exceed the amount paid by you (if any) for
              access to the service in the twelve months preceding the claim.
            </Para>
          </Section>

          <Section title="7. Governing Law and Jurisdiction">
            <Para>
              These Terms shall be governed by and construed in accordance with the laws of
              India. Any disputes arising from or in connection with these Terms shall be
              subject to the exclusive jurisdiction of the courts in{" "}
              <strong>Bengaluru, Karnataka, India</strong>.
            </Para>
          </Section>

          <Section title="8. Changes to Terms">
            <Para>
              We reserve the right to modify these Terms at any time. We will notify users
              of significant changes by email or within the app. Continued use of Zivika
              after changes constitutes acceptance of the revised Terms.
            </Para>
          </Section>

          <Section title="9. Contact Us">
            <Para>
              If you have questions about these Terms, please contact:
            </Para>
            <UL
              items={[
                "Email: support@zivikalabs.com",
                "Legal: legal@zivikalabs.com",
                "Address: Zivika Labs Pvt Ltd, Bengaluru, Karnataka, India",
              ]}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

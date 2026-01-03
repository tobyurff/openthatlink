"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_CONFIG } from "@otl/shared";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? DEFAULT_CONFIG.APP_NAME;
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? DEFAULT_CONFIG.GITHUB_URL;
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? DEFAULT_CONFIG.COMPANY_NAME;
const COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? DEFAULT_CONFIG.COMPANY_ADDRESS;

// Anti-scrape: email stored in parts, assembled client-side
const EMAIL_PARTS = {
  u: process.env.NEXT_PUBLIC_CONTACT_EMAIL_USER ?? "toby-socilo",
  d: process.env.NEXT_PUBLIC_CONTACT_EMAIL_DOMAIN ?? "unstuckable",
  t: process.env.NEXT_PUBLIC_CONTACT_EMAIL_TLD ?? "eu",
};

function useObfuscatedEmail() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    // Assemble email client-side to avoid scrapers
    const e = [EMAIL_PARTS.u, EMAIL_PARTS.d].join(String.fromCharCode(64)) + "." + EMAIL_PARTS.t;
    setEmail(e);
  }, []);
  return email;
}

export function Footer() {
  const contactEmail = useObfuscatedEmail();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <img src="/logo.svg" alt="" style={{ height: 20, width: "auto" }} />
            <span style={{ fontWeight: 500 }}>{APP_NAME}</span>
          </Link>
          <div className="footer-links">
            <Link href="/how-we-dont-use-your-data">What we don&apos;t do with your data</Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
        <div
          style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: "1px solid var(--gray-200)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            fontSize: 13,
            color: "var(--gray-500)",
          }}
        >
          <div>
            {COMPANY_NAME} · {COMPANY_ADDRESS}
          </div>
          <div>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                style={{ color: "var(--gray-500)" }}
              >
                {contactEmail}
              </a>
            ) : (
              <span>...</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Export the hook for use in other components (like privacy page contact section)
export { useObfuscatedEmail };

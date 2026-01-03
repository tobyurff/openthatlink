"use client";

import Link from "next/link";
import { DEFAULT_CONFIG } from "@otl/shared";
import { Header } from "@/components/Header";
import { Footer, useObfuscatedEmail } from "@/components/Footer";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? DEFAULT_CONFIG.GITHUB_URL;
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? DEFAULT_CONFIG.COMPANY_NAME;
const COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? DEFAULT_CONFIG.COMPANY_ADDRESS;

export default function PrivacyPolicy() {
  const contactEmail = useObfuscatedEmail();

  return (
    <>
      <Header variant="full" />

      {/* Content */}
      <main style={{ padding: "80px 0" }}>
        <div className="container-narrow">
          <Link
            href="/"
            style={{
              color: "var(--gray-500)",
              fontSize: 14,
              display: "inline-block",
              marginBottom: 32,
            }}
          >
            ← Back to home
          </Link>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 16 }}>
            How we don&apos;t use your data
          </h1>
          <p style={{ color: "var(--gray-500)", marginBottom: 64, fontSize: 15 }}>
            Last updated: January 2026
          </p>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              marginBottom: 64,
              color: "var(--gray-600)",
            }}
          >
            Most privacy policies explain how companies use your data. This one
            explains how we don&apos;t. OpenThat.Link is designed to store as
            little as possible, for as short a time as possible.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>What we store</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                When you send a link to your webhook URL, we temporarily queue
                it on our server. That&apos;s it. No accounts, no emails, no
                personal information.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>
                How long we store it
              </h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                Links are stored for a <strong>maximum of 48 hours</strong>. In
                practice, they&apos;re deleted much sooner. The moment your
                browser extension polls and opens them in a new tab, they&apos;re
                removed from the queue immediately.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>
                No sign-up required
              </h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                There&apos;s no account creation, no email collection, no login.
                Install the extension, get your webhook URL, and start using it.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>
                No analytics in the extension
              </h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                The browser extension contains no analytics, tracking pixels, or
                telemetry. It does one thing: poll for links and open them.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>Why a server?</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                If it were possible to build this as a purely local extension, we
                would have. But to receive webhook requests and open tabs
                locally, a server component is necessary to bridge the gap.
                We&apos;ve designed it with data sparsity as a priority: the
                server holds your links only until your browser picks them up,
                then deletes them immediately.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>Open source</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                The entire codebase—both the extension and the server—is open
                source and available for inspection at any time. You can review
                exactly what the code does, or even self-host your own instance.
              </p>
              <p style={{ marginTop: 12 }}>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View the source code on GitHub →
                </a>
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>Self-hosting</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                If you prefer complete control over your data, you can self-host
                OpenThat.Link on your own infrastructure. The extension supports
                custom server URLs and is itself open source—built with{" "}
                <a href="https://wxt.dev" target="_blank" rel="noopener noreferrer">
                  WXT
                </a>
                . You can review the code, build it yourself, and load it
                directly into your browser without using any extension store.
                Build instructions are available in the{" "}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </a>
                .
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>Third parties</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                We do not sell, share, or transfer your data to any third
                parties. Links you send are only accessible via your unique
                webhook URL.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>Contact</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.7 }}>
                Questions or concerns? You can reach us at{" "}
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                ) : (
                  <span>...</span>
                )}
                , open an issue on{" "}
                <a
                  href={`${GITHUB_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                , or write to us at:
              </p>
              <p
                style={{
                  color: "var(--gray-600)",
                  lineHeight: 1.7,
                  marginTop: 16,
                  paddingLeft: 16,
                  borderLeft: "2px solid var(--gray-200)",
                }}
              >
                {COMPANY_NAME}
                <br />
                {COMPANY_ADDRESS}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

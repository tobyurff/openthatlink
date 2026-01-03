"use client";

import { useEffect, useState } from "react";
import { DEFAULT_CONFIG } from "@otl/shared";
import { Header, BrowserDropdown } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SECRET_TOTAL_LEN = DEFAULT_CONFIG.SECRET_TOTAL_LEN;
const SECRET_INSERT_POS = DEFAULT_CONFIG.SECRET_INSERT_POS;
const RECOGNIZABLE_TOKEN = DEFAULT_CONFIG.RECOGNIZABLE_TOKEN;

// Use env vars with fallback to defaults for white-labeling support
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_CONFIG.PUBLIC_BASE_URL;
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? DEFAULT_CONFIG.GITHUB_URL;

function isValidSecret(secret: string): boolean {
  if (secret.length !== SECRET_TOTAL_LEN) return false;
  const token = secret.substring(
    SECRET_INSERT_POS,
    SECRET_INSERT_POS + RECOGNIZABLE_TOKEN.length
  );
  return token === RECOGNIZABLE_TOKEN;
}

export default function Home() {
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && isValidSecret(hash)) {
      setSecret(hash);
    }
  }, []);

  const secretDisplay = secret || "YOUR-SECRET-TOKEN";
  const hasSecret = !!secret;

  return (
    <>
      <Header variant="full" />

      {/* Hero Section */}
      <section style={{ padding: "120px 0 100px", overflow: "hidden" }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <h1
                style={{
                  fontSize: "clamp(40px, 6vw, 72px)",
                  fontWeight: 700,
                  marginBottom: 32,
                  maxWidth: 700,
                }}
              >
                Trigger a webhook → open a link in your local browser.
              </h1>
              <p
                style={{
                  fontSize: 20,
                  color: "var(--gray-600)",
                  lineHeight: 1.6,
                  marginBottom: 48,
                  maxWidth: 560,
                }}
              >
                Connect your automation tools to your browser. Send links from
                Zapier, n8n, Make, your own code, or any webhook-capable tool and
                they open automatically in new tabs.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <BrowserDropdown />
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  View on GitHub
                </a>
              </div>
            </div>
            <div className="hero-image-wrapper">
              <img
                src="/hero-illustration.png"
                alt="OpenThatLink illustration showing webhook to browser connection"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="section"
        style={{ borderTop: "1px solid var(--gray-200)" }}
      >
        <div className="container">
          <h2 style={{ fontSize: 32, marginBottom: 48 }}>How it works</h2>
          <div className="feature-grid" style={{ gap: 48 }}>
            <div className="feature-card">
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--gray-400)",
                  marginBottom: 12,
                }}
              >
                01
              </div>
              <div className="feature-title">Install the extension</div>
              <div className="feature-description">
                Add the browser extension from the Chrome Web Store. No account
                or signup needed.
              </div>
            </div>
            <div className="feature-card">
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--gray-400)",
                  marginBottom: 12,
                }}
              >
                02
              </div>
              <div className="feature-title">Copy your webhook URL</div>
              <div className="feature-description">
                Each installation gets a unique webhook URL. Use it in your
                automation workflows.
              </div>
            </div>
            <div className="feature-card">
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--gray-400)",
                  marginBottom: 12,
                }}
              >
                03
              </div>
              <div className="feature-title">Send links via webhook</div>
              <div className="feature-description">
                Make HTTP requests to your webhook. Links open automatically in
                your browser.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="section"
        style={{ borderTop: "1px solid var(--gray-200)" }}
      >
        <div className="container">
          <h2 style={{ fontSize: 32, marginBottom: 48 }}>Built for privacy</h2>
          <div className="feature-grid" style={{ gap: 48 }}>
            <div className="feature-card">
              <div className="feature-title">No account needed</div>
              <div className="feature-description">
                No email, no password, no personal data. Install and start using
                immediately.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-title">Links auto-delete</div>
              <div className="feature-description">
                Links are deleted the moment your browser opens them. Maximum
                retention: 48 hours.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-title">Open source</div>
              <div className="feature-description">
                Every line of code is public. Inspect it, audit it, or self-host
                your own instance.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-title">Simple API</div>
              <div className="feature-description">
                One endpoint, GET or POST. Works with any tool that can make
                HTTP requests.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Webhook/HTTP Request Section */}
      <section
        id="usage"
        className="section"
        style={{ borderTop: "1px solid var(--gray-200)" }}
      >
        <div className="container">
          <h2 style={{ fontSize: 32, marginBottom: 16 }}>Send links to your browser</h2>
          <p
            style={{
              color: "var(--gray-600)",
              marginBottom: 48,
              maxWidth: 600,
            }}
          >
            Use your webhook URL in n8n (HTTP Request node), Zapier (Webhooks), Make,
            or any tool that can send HTTP requests. Developers can use it as a REST API endpoint.
          </p>

          {hasSecret && (
            <div className="success-banner" style={{ marginBottom: 32 }}>
              These examples use your actual webhook URL. Copy and use them
              directly.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <h3
                style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}
              >
                Open a single link
              </h3>
              <p
                style={{
                  color: "var(--gray-600)",
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                Pass the link as a query parameter.
              </p>
              <pre className="code-block">
                GET {PUBLIC_BASE_URL}/{secretDisplay}?link=example.com
              </pre>
            </div>

            <div>
              <h3
                style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}
              >
                Open multiple links
              </h3>
              <p
                style={{
                  color: "var(--gray-600)",
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                Comma-separate multiple links in a single request.
              </p>
              <pre className="code-block">
                GET {PUBLIC_BASE_URL}/{secretDisplay}
                ?link=google.com,github.com,example.com
              </pre>
            </div>

            <div>
              <h3
                style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}
              >
                POST with JSON
              </h3>
              <p
                style={{
                  color: "var(--gray-600)",
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                Send a JSON body for more complex use cases.
              </p>
              <pre className="code-block">
                {`curl -X POST ${PUBLIC_BASE_URL}/${secretDisplay} \\
  -H "Content-Type: application/json" \\
  -d '{"links": ["https://google.com", "https://github.com"]}'`}
              </pre>
            </div>
          </div>

          {!hasSecret && (
            <p
              style={{
                color: "var(--gray-500)",
                fontSize: 14,
                marginTop: 48,
              }}
            >
              Install the extension to get your personal webhook URL with
              working examples.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

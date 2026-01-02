"use client";

import { useEffect, useState } from "react";

// Secret format: 16 chars with "OTL" at position 8
const SECRET_TOTAL_LEN = 16;
const SECRET_INSERT_POS = 8;
const RECOGNIZABLE_TOKEN = "OTL";

function isValidSecret(secret: string): boolean {
  if (secret.length !== SECRET_TOTAL_LEN) return false;
  const token = secret.substring(SECRET_INSERT_POS, SECRET_INSERT_POS + RECOGNIZABLE_TOKEN.length);
  return token === RECOGNIZABLE_TOKEN;
}

export default function Home() {
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    // Read secret from URL hash (e.g., #ABC12345OTL67890)
    const hash = window.location.hash.slice(1); // Remove the #
    if (hash && isValidSecret(hash)) {
      setSecret(hash);
    }
  }, []);

  const secretDisplay = secret || "<SECRET>";
  const hasSecret = !!secret;

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>OpenThat.Link</h1>
      <p>
        Open links in your browser from Zapier, n8n, or any webhook-capable
        tool.
      </p>

      {hasSecret && (
        <div style={{
          background: "#f0f9f0",
          border: "1px solid #22c55e",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "24px",
          color: "#166534"
        }}>
          Examples below are using your secret. You can copy and use them directly!
        </div>
      )}

      <h2>How it works</h2>
      <ol>
        <li>Install the Chrome extension</li>
        <li>Copy your unique webhook URL</li>
        <li>Send links to the webhook from your automation tool</li>
        <li>Links open automatically in your browser</li>
      </ol>

      <h2>API Usage</h2>
      <h3>Enqueue links</h3>
      <pre>
        {`GET /${secretDisplay}?link=example.com
GET /${secretDisplay}?link=a.com,b.com,c.com
POST /${secretDisplay} with {"links": ["a.com", "b.com"]}`}
      </pre>
      <h3>Poll for links (used by extension)</h3>
      <pre>{`GET /${secretDisplay}/extension-poll`}</pre>
    </main>
  );
}

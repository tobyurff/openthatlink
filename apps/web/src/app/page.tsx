export default function Home() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>OpenThat.Link</h1>
      <p>
        Open links in your browser from Zapier, n8n, or any webhook-capable
        tool.
      </p>
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
        {`GET /api/<SECRET>?link=example.com
GET /api/<SECRET>?link=a.com,b.com,c.com
POST /api/<SECRET> with {"links": ["a.com", "b.com"]}`}
      </pre>
      <h3>Poll for links (used by extension)</h3>
      <pre>{`GET /api/<SECRET>/extension-poll`}</pre>
    </main>
  );
}

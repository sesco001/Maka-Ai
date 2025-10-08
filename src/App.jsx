import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [q, setQ] = useState("");
  const [log, setLog] = useState([]);
  const [file, setFile] = useState(null);
  const [providersInput, setProvidersInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!q && !file) return;
    setLoading(true);

    const form = new FormData();
    if (file) form.append("file", file);
    if (q) form.append("q", q);
    if (providersInput) form.append("providers", providersInput);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setLog((l) => [{ time: Date.now(), q, response: data }, ...l]);
    } catch (err) {
      setLog((l) => [
        { time: Date.now(), q, response: { error: err.message } },
        ...l,
      ]);
    } finally {
      setLoading(false);
      setQ("");
      setFile(null);
    }
  }

  return (
    <div className="container">
      <h1>🤖 Maka AI</h1>
      <p className="tagline">
        Multi-provider AI proxy • Upload files • Custom endpoints
      </p>

      <div className="input-area">
        <input
          type="text"
          placeholder="Ask something..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Providers (comma separated, e.g. openai,anthropic)"
          value={providersInput}
          onChange={(e) => setProvidersInput(e.target.value)}
        />
        <button onClick={send} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>

      <div className="log">
        {log.map((entry) => (
          <div key={entry.time} className="log-item">
            <p>
              <strong>Q:</strong> {entry.q}
            </p>
            <pre>
              {JSON.stringify(entry.response, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

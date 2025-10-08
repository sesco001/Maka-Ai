import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://backend12-jknk.onrender.com";

export default function App() {
  const [tab, setTab] = useState("chat"); // chat / image / lyrics
  const [q, setQ] = useState("");
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const send = async () => {
    let body = new FormData();
    let requestQ = "";

    if (tab === "chat") {
      if (!q && !file) return;
      body.append("q", q);
      if (file) body.append("file", file);
      requestQ = q;
    } else if (tab === "image") {
      if (!file) return;
      body.append("file", file);
      if (q) body.append("q", q);
      requestQ = q || file.name;
    } else if (tab === "lyrics") {
      if (!topic) return;
      requestQ = `Generate ${genre || "any"} lyrics about "${topic}" with mood "${mood || "any"}"`;
      body.append("q", requestQ);
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        body,
      });
      const data = await res.text(); // backend returns plain text
      setLog((l) => [
        { time: Date.now(), tab, q: requestQ, response: data },
        ...l,
      ]);
    } catch (err) {
      setLog((l) => [
        { time: Date.now(), tab, q: requestQ, response: `Error: ${err.message}` },
        ...l,
      ]);
    } finally {
      setLoading(false);
      setQ("");
      setFile(null);
      setTopic("");
      setGenre("");
      setMood("");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">🤖 Maka AI</h1>
      <p className="text-gray-600 mb-4">
        Multi-provider AI proxy • Upload files • Lyrics & Vision
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["chat", "image", "lyrics"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Inputs per tab */}
      <div className="flex flex-col gap-2 mb-4">
        {tab === "chat" && (
          <>
            <input
              type="text"
              placeholder="Ask something..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2 rounded"
            />
          </>
        )}

        {tab === "image" && (
          <>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-2 rounded"
            />
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="my-2 max-h-40 rounded"
              />
            )}
            <input
              type="text"
              placeholder="Optional caption / question..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border p-2 rounded"
            />
          </>
        )}

        {tab === "lyrics" && (
          <>
            <input
              type="text"
              placeholder="Topic (e.g., heartbreak)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Genre (optional, e.g., blues)"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Mood (optional, e.g., sad)"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="border p-2 rounded"
            />
          </>
        )}

        <button
          onClick={send}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>

      {/* Log */}
      <div className="log flex flex-col gap-4">
        {log.map((entry) => (
          <div
            key={entry.time}
            className="log-item p-3 border rounded bg-gray-50 relative"
          >
            <p className="font-semibold mb-1">
              [{entry.tab.toUpperCase()}] Q: {entry.q}
            </p>
            <pre className="whitespace-pre-wrap">{entry.response}</pre>
            <button
              onClick={() => copyToClipboard(entry.response)}
              className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

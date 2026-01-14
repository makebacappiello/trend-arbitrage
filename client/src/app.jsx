import { useEffect, useState } from "react";

export default function App() {
  const [category, setCategory] = useState("tech");
  const [limit, setLimit] = useState(20);
  const [trends, setTrends] = useState([]);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Vite env var
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000";

  async function loadTrends() {
    setStatus("Loading...");
    setError("");

    try {
      const url = `${API_BASE}/api/trends?category=${category}&limit=${limit}`;
      const res = await fetch(url);
      const data = await res.json();
      setTrends(data.trends || []);
    } catch (err) {
      setError(err.message);
    }

    setStatus("");
  }

  async function refreshTrends() {
    setStatus("Refreshing...");
    setError("");

    try {
      await fetch(`${API_BASE}/api/trends/refresh`, { method: "POST" });
      await loadTrends();
    } catch (err) {
      setError(err.message);
    }

    setStatus("");
  }

  // load data when page loads or when category/limit changes
  useEffect(() => {
    loadTrends();
  }, [category, limit]);

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>Trend Arbitrage</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <label>
          Category:
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="tech">tech</option>
          </select>
        </label>

        <label>
          Limit:
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </label>

        <button onClick={refreshTrends}>Refresh</button>
        <button onClick={loadTrends}>Reload</button>
      </div>

      {status && (
        <p>
          <b>{status}</b>
        </p>
      )}
      {error && (
        <p style={{ color: "red" }}>
          <b>Error:</b> {error}
        </p>
      )}

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Topic</th>
            <th>Score</th>
            <th>Mentions (2h / prev)</th>
            <th>Sources</th>
          </tr>
        </thead>

        <tbody>
          {trends.map((t) => (
            <tr key={`${t.category}-${t.normalized_topic}`}>
              <td>
                <b>{t.display_topic}</b>
              </td>
              <td>{Number(t.score).toFixed(2)}</td>
              <td>
                {t.mentions_recent} / {t.mentions_prev}
              </td>
              <td>{(t.sources_list || []).join(", ")}</td>
            </tr>
          ))}

          {trends.length === 0 && (
            <tr>
              <td colSpan="4">No trends yet. Click Refresh.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

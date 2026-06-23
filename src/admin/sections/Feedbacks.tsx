import { useEffect, useState } from "react";

interface Feedback {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  status: string;
}

export default function FeedbacksSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/feedback");
      if (!resp.ok) throw new Error("Server error");
      const data = await resp.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load feedbacks. Make sure the API is deployed.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="admin-section-content">
      <div className="admin-section-header-bar">
        <h2>💬 User Feedbacks & Suggestions</h2>
        <button className="admin-refresh-btn" onClick={fetchFeedbacks} title="Refresh">
          🔄
        </button>
      </div>

      {loading && (
        <div className="admin-feedback-loading">Loading feedbacks...</div>
      )}

      {error && (
        <div className="admin-feedback-error">{error}</div>
      )}

      {!loading && !error && feedbacks.length === 0 && (
        <div className="admin-feedback-empty">
          <span className="admin-feedback-empty-icon">📭</span>
          <p>No feedbacks received yet.</p>
        </div>
      )}

      {!loading && !error && feedbacks.length > 0 && (
        <>
          <div className="admin-feedback-count">
            {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""} received
          </div>
          <div className="admin-feedback-table-wrap">
            <table className="admin-feedback-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb, idx) => (
                  <tr
                    key={fb.id}
                    className="admin-feedback-row"
                    onClick={() => setSelected(fb)}
                  >
                    <td className="admin-feedback-idx">{idx + 1}</td>
                    <td className="admin-feedback-title-cell">{fb.title}</td>
                    <td className="admin-feedback-date">{formatDate(fb.createdAt)}</td>
                    <td>
                      <span className={`admin-feedback-status admin-feedback-status-${fb.status}`}>
                        {fb.status === "new" ? "🆕 New" : fb.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail popup */}
      {selected && (
        <div className="admin-feedback-overlay" onClick={() => setSelected(null)}>
          <div className="admin-feedback-popup" onClick={(e) => e.stopPropagation()}>
            <div className="admin-feedback-popup-header">
              <h3>{selected.title}</h3>
              <button className="admin-feedback-popup-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="admin-feedback-popup-meta">
              <span>📅 {formatDate(selected.createdAt)}</span>
              <span className={`admin-feedback-status admin-feedback-status-${selected.status}`}>
                {selected.status === "new" ? "🆕 New" : selected.status}
              </span>
            </div>
            <div className="admin-feedback-popup-body">
              <p>{selected.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

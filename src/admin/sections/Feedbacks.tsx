import { customAlert, customConfirm } from "../../components/CustomAlert";
import { useEffect, useState } from "react";
import { 
  MessageSquare, RefreshCw, Inbox, CheckCircle2, 
  Sparkles, Calendar, Trash2, Check, X, Clock 
} from "lucide-react";

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

  async function handleMarkCompleted(id: string) {
    try {
      const resp = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" }),
      });
      if (!resp.ok) throw new Error();
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "completed" } : f));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: "completed" } : null);
    } catch {
      customAlert("Failed to mark as completed.");
    }
  }

  async function handleDelete(id: string) {
    if (!await customConfirm("Are you sure you want to delete this feedback?")) return;
    try {
      const resp = await fetch(`/api/feedback?id=${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error();
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      customAlert("Failed to delete feedback.");
    }
  }

  return (
    <div className="admin-section-content">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={22} className="admin-title-icon" />
            <span>User Feedbacks &amp; Suggestions</span>
          </h2>
          <p className="admin-section-desc">
            Review thoughts, bug reports, and enhancement ideas submitted by app users.
          </p>
        </div>
        <button 
          type="button"
          className="admin-btn admin-btn-secondary" 
          onClick={fetchFeedbacks} 
          title="Refresh Feedbacks"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="admin-card" style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: 12 }} />
          <div>Loading user feedbacks...</div>
        </div>
      )}

      {error && (
        <div className="admin-card" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: 16 }}>
          {error}
        </div>
      )}

      {!loading && !error && feedbacks.length === 0 && (
        <div className="admin-card" style={{ textAlign: "center", padding: 50, color: "var(--text2)" }}>
          <div style={{ color: "var(--text3)", marginBottom: 12 }}>
            <Inbox size={42} />
          </div>
          <p style={{ margin: 0, fontWeight: 500 }}>No feedbacks received yet.</p>
        </div>
      )}

      {!loading && !error && feedbacks.length > 0 && (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text2)" }}>
              {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""} recorded
            </span>
          </div>

          <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ width: 80, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb, idx) => (
                  <tr
                    key={fb.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelected(fb)}
                  >
                    <td style={{ color: "var(--text3)", fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{fb.title}</td>
                    <td style={{ color: "var(--text2)", fontSize: "0.85rem" }}>{formatDate(fb.createdAt)}</td>
                    <td>
                      <span className={`admin-badge ${fb.status === "completed" ? "admin-badge-success" : "admin-badge-live"}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {fb.status === "completed" ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            <span>New</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title="Delete feedback"
                        onClick={() => handleDelete(fb.id)}
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "#ef4444",
                          borderRadius: 8,
                          padding: "5px 8px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s"
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-card" style={{ maxWidth: 520, width: "90%", margin: "auto", position: "relative", zIndex: 1100 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, borderBottom: "1px solid var(--border)", paddingBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{selected.title}</h3>
              <button 
                type="button" 
                className="admin-header-icon-btn" 
                onClick={() => setSelected(null)}
                style={{ flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "14px 0", fontSize: "0.82rem", color: "var(--text2)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Clock size={14} />
                {formatDate(selected.createdAt)}
              </span>
              <span className={`admin-badge ${selected.status === "completed" ? "admin-badge-success" : "admin-badge-live"}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {selected.status === "completed" ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                <span>{selected.status === "completed" ? "Completed" : "New"}</span>
              </span>
            </div>

            <div style={{ background: "var(--surface2)", padding: 14, borderRadius: 12, border: "1px solid var(--border)", color: "var(--text)", lineHeight: 1.6, fontSize: "0.92rem", marginBottom: 20 }}>
              {selected.description}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              {selected.status !== "completed" && (
                <button 
                  type="button"
                  className="admin-btn admin-btn-success" 
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
                  onClick={() => handleMarkCompleted(selected.id)}
                >
                  <Check size={15} />
                  <span>Mark as Completed</span>
                </button>
              )}
              <button 
                type="button"
                className="admin-btn admin-btn-danger" 
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px" }}
                onClick={() => handleDelete(selected.id)}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

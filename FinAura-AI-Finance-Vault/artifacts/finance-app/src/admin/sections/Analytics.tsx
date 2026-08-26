import { useEffect, useState } from "react";
import { SessionRecord } from "../adminTypes";
import { loadSessions, loadEvents, getActiveUserCount } from "../adminStorage";

function formatDuration(start: number, end?: number): string {
  const ms = (end ?? Date.now()) - start;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function AnalyticsSection() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setSessions(loadSessions());
      setActiveUsers(getActiveUserCount());
      setTick((t) => t + 1);
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  const events = loadEvents();
  const last7Days = getLast7Days();

  const sessionsByDay = last7Days.map((date) => ({
    date,
    count: sessions.filter((s) => s.date === date).length,
  }));

  const maxDaySessions = Math.max(...sessionsByDay.map((d) => d.count), 1);

  const totalSessions = sessions.length;
  const todaySessions = sessions.filter((s) => s.date === last7Days[6]).length;

  const avgDuration = sessions
    .filter((s) => s.endTime)
    .reduce((acc, s) => acc + (s.endTime! - s.startTime), 0) /
    Math.max(sessions.filter((s) => s.endTime).length, 1);

  const tabTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    Object.entries(s.tabVisits).forEach(([tab, count]) => {
      tabTotals[tab] = (tabTotals[tab] ?? 0) + count;
    });
  });
  const tabEntries = Object.entries(tabTotals).sort((a, b) => b[1] - a[1]);
  const maxTabCount = Math.max(...tabEntries.map(([, c]) => c), 1);

  const eventTypes: Record<string, number> = {};
  events.forEach((ev) => {
    eventTypes[ev.type] = (eventTypes[ev.type] ?? 0) + 1;
  });
  const eventEntries = Object.entries(eventTypes).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const recentSessions = [...sessions].reverse().slice(0, 10);

  const dayLabels: Record<string, string> = {
    [last7Days[6]]: "Today",
    [last7Days[5]]: "Yesterday",
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">User Analytics</h2>
          <p className="admin-section-desc">
            Session tracking, tab usage, and feature events. Refreshes every 5 seconds.
          </p>
        </div>
        <div className="admin-realtime-badge">
          <span className={`admin-pulse ${activeUsers > 0 ? "active" : ""}`} />
          <span>{activeUsers > 0 ? `${activeUsers} user online` : "No active users"}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📊</span>
          <div>
            <div className="admin-stat-value">{totalSessions}</div>
            <div className="admin-stat-label">Total Sessions</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📅</span>
          <div>
            <div className="admin-stat-value">{todaySessions}</div>
            <div className="admin-stat-label">Today's Sessions</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">⏱️</span>
          <div>
            <div className="admin-stat-value">
              {avgDuration > 0 ? formatDuration(0, avgDuration) : "—"}
            </div>
            <div className="admin-stat-label">Avg. Session Duration</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">⚡</span>
          <div>
            <div className="admin-stat-value">{events.length}</div>
            <div className="admin-stat-label">Total Events</div>
          </div>
        </div>
      </div>

      {/* Sessions chart - last 7 days */}
      <div className="admin-analytics-card">
        <h3 className="admin-analytics-subtitle">Sessions — Last 7 Days</h3>
        <div className="admin-bar-chart">
          {sessionsByDay.map((d) => (
            <div key={d.date} className="admin-bar-col">
              <span className="admin-bar-val">{d.count || ""}</span>
              <div
                className="admin-bar"
                style={{ height: `${(d.count / maxDaySessions) * 100}%` }}
              />
              <span className="admin-bar-label">
                {dayLabels[d.date] ?? d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab usage */}
      {tabEntries.length > 0 && (
        <div className="admin-analytics-card">
          <h3 className="admin-analytics-subtitle">Tab Usage</h3>
          <div className="admin-hbar-list">
            {tabEntries.map(([tab, count]) => (
              <div key={tab} className="admin-hbar-row">
                <span className="admin-hbar-label">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                <div className="admin-hbar-track">
                  <div
                    className="admin-hbar-fill"
                    style={{ width: `${(count / maxTabCount) * 100}%` }}
                  />
                </div>
                <span className="admin-hbar-val">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event breakdown */}
      {eventEntries.length > 0 && (
        <div className="admin-analytics-card">
          <h3 className="admin-analytics-subtitle">Feature Events</h3>
          <div className="admin-event-grid">
            {eventEntries.map(([type, count]) => (
              <div key={type} className="admin-event-chip">
                <span className="admin-event-name">{type.replace(/_/g, " ")}</span>
                <span className="admin-event-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="admin-analytics-card">
          <h3 className="admin-analytics-subtitle">Recent Sessions</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Tabs Visited</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td>{formatDuration(s.startTime, s.endTime)}</td>
                    <td>{Object.keys(s.tabVisits).join(", ") || "—"}</td>
                    <td>
                      <span className={`admin-badge ${s.endTime ? "admin-badge-success" : "admin-badge-live"}`}>
                        {s.endTime ? "Ended" : "● Live"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalSessions === 0 && (
        <div className="admin-empty">
          <span className="admin-empty-icon">📈</span>
          <p>No analytics data yet. Data is collected when users interact with the app.</p>
        </div>
      )}
    </div>
  );
}

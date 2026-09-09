import React, { useState } from "react";
import { Database, Download, Upload, Server, Power } from "lucide-react";
import { customAlert, customConfirm } from "../../components/CustomAlert";

export default function SystemOperationsSection() {
  const [importing, setImporting] = useState(false);

  function handleExportData() {
    try {
      const dataToExport = {
        admin_card_templates: localStorage.getItem("admin_card_templates"),
        admin_popup_ads: localStorage.getItem("admin_popup_ads"),
        admin_analytics_sessions: localStorage.getItem("admin_analytics_sessions"),
        admin_analytics_events: localStorage.getItem("admin_analytics_events"),
        admin_theme_settings: localStorage.getItem("admin_theme_settings"),
        admin_global_config: localStorage.getItem("admin_global_config"),
        admin_custom_currencies: localStorage.getItem("admin_custom_currencies")
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finaura_admin_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      customAlert("Failed to export data.", "Export Error", "error");
    }
  }

  function handleImportData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (await customConfirm("This will overwrite all existing admin configurations. Are you sure you want to proceed?")) {
          for (const key of Object.keys(data)) {
            if (data[key]) {
              localStorage.setItem(key, data[key]);
            }
          }
          customAlert("Data imported successfully! The dashboard will now reload.", "Import Success", "success");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err) {
        customAlert("Invalid backup file. Please upload a valid JSON backup.", "Import Error", "error");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="admin-section-content">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Server size={22} className="admin-title-icon" />
            <span>System Operations</span>
          </h2>
          <p className="admin-section-desc">
            Manage data backups, system state, and global administration tasks.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Database size={18} color="var(--primary)" />
          <span>Data Backup & Restore</span>
        </h3>
        <p className="admin-card-desc">
          Export your entire admin configuration (Cards, Settings, Themes, Ads, Analytics) as a JSON file, or restore from an existing backup.
        </p>

        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          <button 
            type="button" 
            className="admin-btn admin-btn-primary" 
            onClick={handleExportData}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Download size={16} />
            Export System Data
          </button>

          <label className="admin-btn admin-btn-outline" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: importing ? 0.6 : 1 }}>
            <Upload size={16} />
            <span>{importing ? "Importing..." : "Import Data"}</span>
            <input 
              type="file" 
              accept=".json" 
              style={{ display: "none" }} 
              onChange={handleImportData}
              disabled={importing}
            />
          </label>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Power size={18} color="#ef4444" />
          <span>System Reset</span>
        </h3>
        <p className="admin-card-desc">
          Wipe all administrative data (Cards, Settings, Themes, Ads) and return to a clean slate. Analytics data and master security PIN will NOT be deleted.
        </p>
        <button 
          type="button" 
          className="admin-btn" 
          onClick={async () => {
            if (await customConfirm("Are you absolutely sure you want to WIPE all admin data? This action cannot be undone unless you have a backup.")) {
                localStorage.removeItem("admin_card_templates");
                localStorage.removeItem("admin_popup_ads");
                localStorage.removeItem("admin_theme_settings");
                localStorage.removeItem("admin_global_config");
                localStorage.removeItem("admin_custom_currencies");
                customAlert("Admin data wiped successfully. Reloading...");
                setTimeout(() => window.location.reload(), 1500);
            }
          }}
          style={{ background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger)", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14 }}
        >
          <Power size={16} />
          Factory Reset Data
        </button>
      </div>

    </div>
  );
}

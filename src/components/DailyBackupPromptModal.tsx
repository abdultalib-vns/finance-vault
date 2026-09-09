import { useState } from "react";
import { 
  ShieldCheck, 
  Download, 
  X, 
  CheckCircle2 
} from "lucide-react";
import { exportVaultDirect } from "../lib/importExport";
import { markDailyBackupPromptShown } from "../lib/backupReminder";
import { customAlert } from "./CustomAlert";

interface Props {
  onClose: () => void;
  onBackupSuccess?: () => void;
}

export default function DailyBackupPromptModal({ onClose, onBackupSuccess }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleConfirmBackup() {
    setIsExporting(true);
    try {
      const fileName = await exportVaultDirect();
      markDailyBackupPromptShown();
      customAlert(
        `Your daily encrypted vault backup (${fileName}) has been downloaded successfully.`,
        "Daily Backup Created",
        "success"
      );
      if (onBackupSuccess) onBackupSuccess();
      onClose();
    } catch (err: any) {
      console.error("Daily backup export failed:", err);
      customAlert(
        "Failed to create daily backup. Please try again from Settings.",
        "Backup Failed",
        "error"
      );
      setIsExporting(false);
    }
  }

  function handleDismiss() {
    markDailyBackupPromptShown();
    onClose();
  }

  return (
    <div className="daily-backup-sheet-overlay" onClick={handleDismiss}>
      <div 
        className="daily-backup-sheet-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Bar */}
        <div className="daily-backup-drag-area">
          <div className="daily-backup-drag-bar" />
        </div>

        {/* Header Icon + Brand */}
        <div className="daily-backup-sheet-header">
          <div className="daily-backup-emblem-wrap">
            <div className="daily-backup-emblem-pulse">
              <ShieldCheck size={28} />
            </div>
          </div>

          <button 
            type="button" 
            className="daily-backup-close-btn"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="daily-backup-sheet-body">
          <span className="daily-backup-pill-badge">DAILY VAULT PROTECTION</span>
          <h2 className="daily-backup-title">Create a backup now?</h2>
          <p className="daily-backup-desc">
            Keep your financial data safe. We can export an encrypted offline copy of your entire vault to your device right now.
          </p>

          <div className="daily-backup-feature-card">
            <div className="daily-backup-feature-row">
              <CheckCircle2 size={16} className="daily-backup-check-icon" />
              <span><strong>No PIN or Biometrics Needed:</strong> You are already authenticated on this device.</span>
            </div>
            <div className="daily-backup-feature-row">
              <CheckCircle2 size={16} className="daily-backup-check-icon" />
              <span><strong>100% Zero-Knowledge:</strong> Encrypted locally and saved directly to your Downloads folder.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="daily-backup-actions">
            <button
              type="button"
              className="daily-backup-primary-btn"
              onClick={handleConfirmBackup}
              disabled={isExporting}
            >
              <Download size={18} />
              <span>{isExporting ? "Securing & Downloading…" : "Yes, Create Backup Now"}</span>
            </button>

            <button
              type="button"
              className="daily-backup-secondary-btn"
              onClick={handleDismiss}
              disabled={isExporting}
            >
              Remind Me Tomorrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

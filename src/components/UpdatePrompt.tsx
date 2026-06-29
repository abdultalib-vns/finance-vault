import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
      // Periodically check for updates every 5 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="update-toast">
      <div className="update-toast-content">
        <RefreshCw size={18} className="update-icon spin" style={{color:'var(--primary)'}} />
        <div className="update-text">
          <span className="update-title">Update Available</span>
          <span className="update-sub">A new version has been deployed.</span>
        </div>
      </div>
      <div className="update-actions">
        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => updateServiceWorker(true)}>
          Reload
        </button>
        <button className="icon-btn" style={{ marginLeft: 8 }} onClick={() => setNeedRefresh(false)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

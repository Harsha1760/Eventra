import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <aside 
        aria-label="Notifications" 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{
              pointerEvents: 'auto',
              padding: '12px 18px',
              borderRadius: '6px',
              backgroundColor: toast.type === 'error' ? '#1E1413' : '#141418',
              color: '#F5F5F7',
              fontSize: '0.88rem',
              lineHeight: 1.45,
              border: `1px solid ${
                toast.type === 'error'
                  ? 'rgba(216, 58, 32, 0.4)'
                  : toast.type === 'success'
                  ? 'rgba(74, 222, 128, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)'
              }`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#8E8E98',
                cursor: 'pointer',
                fontSize: '1.1rem',
                lineHeight: 1,
                padding: '2px',
              }}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}


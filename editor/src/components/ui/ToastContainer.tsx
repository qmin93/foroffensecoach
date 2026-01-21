'use client';

import { useToastStore, ToastType } from '@/store/toastStore';

const typeStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-500/50',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-500/50',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-500/50',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-500/50',
    icon: 'ℹ',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const style = typeStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={`
              ${style.bg} ${style.border}
              border rounded-lg shadow-lg p-4 pr-10
              animate-slide-in-right
              backdrop-blur-sm
              text-white text-sm
            `}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0" aria-hidden="true">
                {style.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="break-words">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="mt-2 text-xs font-medium underline hover:no-underline"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 p-1 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

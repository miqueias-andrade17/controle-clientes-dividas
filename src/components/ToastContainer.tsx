import type { ToastMessage } from '../types';

type Props = {
  toasts: ToastMessage[];
};

export function ToastContainer({ toasts }: Props) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

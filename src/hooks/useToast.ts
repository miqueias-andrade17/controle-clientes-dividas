import { useCallback, useState } from 'react';
import type { ToastMessage } from '../types';
import { generateId } from '../lib/utils';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = generateId();
    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return {
    toasts,
    success: (message: string) => pushToast(message, 'success'),
    error: (message: string) => pushToast(message, 'error'),
    info: (message: string) => pushToast(message, 'info'),
  };
}

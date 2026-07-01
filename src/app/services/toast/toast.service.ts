import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration: number;
  isPaused?: boolean;
  timeoutId?: any; // To hold our active window timeout reference
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();
  private counter = 0;

  show(type: 'success' | 'error' | 'info', title: string, message: string, duration = 4000) {
    const id = this.counter++;

    const timeoutId = setTimeout(() => {
      this.remove(id);
    }, duration);

    const newToast: ToastMessage = { id, type, title, message, duration, isPaused: false, timeoutId };
    this.toastsSignal.update(current => [...current, newToast]);
  }

  pauseToast(id: number) {
    this.toastsSignal.update(toasts =>
      toasts.map(t => {
        if (t.id === id) {
          clearTimeout(t.timeoutId); // Freeze the auto-dismiss timer execution
          return { ...t, isPaused: true };
        }
        return t;
      })
    );
  }

  resumeToast(id: number) {
    this.toastsSignal.update(toasts =>
      toasts.map(t => {
        if (t.id === id) {
          // Restart the removal countdown cleanly from the beginning duration length
          const timeoutId = setTimeout(() => this.remove(id), t.duration);
          return { ...t, isPaused: false, timeoutId };
        }
        return t;
      })
    );
  }

  remove(id: number) {
    const toast = this.toastsSignal().find(t => t.id === id);
    if (toast?.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }
}
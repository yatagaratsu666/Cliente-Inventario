import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toastState = this.toastSubject.asObservable();

  show(type: ToastMessage['type'], text: string) {
    this.toastSubject.next({ type, text });
  }

  success(text: string) {
    this.show('success', text);
  }

  error(text: string) {
    this.show('error', text);
  }

  info(text: string) {
    this.show('info', text);
  }

  warning(text: string) {
    this.show('warning', text);
  }
}

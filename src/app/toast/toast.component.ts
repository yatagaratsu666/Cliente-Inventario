import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ToastComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toastState.subscribe((toast: ToastMessage) => {
      this.toasts.push(toast);

      // Elimina el toast después de 3 segundos
      setTimeout(() => this.removeToast(toast), 3000);
    });
  }

  removeToast(toast: ToastMessage) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}

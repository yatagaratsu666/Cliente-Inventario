import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-app-recover',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app-recover.component.html',
  styleUrls: ['./app-recover.component.css']
})
export class AppRecoverComponent {
  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.email) {
      this.errorMessage = 'Por favor ingresa un correo válido.';
      return;
    }

    this.isLoading = true;

    this.loginService.recoverPassword(this.email).subscribe({
      next: (response) => {
        console.log('Recuperación exitosa:', response);
        this.successMessage = 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña.';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar contraseña:', err);
        this.errorMessage = 'No se pudo enviar el correo. Verifica el email o intenta más tarde.';
        this.isLoading = false;
      }
    });
  }
}

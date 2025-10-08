import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-app-setpassword',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-setpassword.component.html',
  styleUrls: ['./app-setpassword.component.css']
})
export class SetPasswordComponent implements OnInit {
  newPassword = '';
  token = '';
  message = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (this.token.startsWith(':')) {
      this.token = this.token.substring(1);
    }
    console.log('Token limpio:', this.token);
    if (!this.token) {
      this.errorMessage = 'Token no válido o expirado.';
    }
  }

  onSubmit(): void {
    console.log('Token capturado desde URL:', this.token);
    this.errorMessage = '';
    this.message = '';


    if (!this.token) {
      this.errorMessage = 'Token no válido o expirado.';
      return;
    }

    this.isSubmitting = true;


    this.loginService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        console.log('Contraseña cambiada exitosamente:', response);
        this.message = 'Tu contraseña ha sido restablecida con éxito.';
        this.isSubmitting = false;

        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
        this.errorMessage = 'No se pudo restablecer la contraseña. Intenta de nuevo.';
        this.isSubmitting = false;
      }
    });
  }
}

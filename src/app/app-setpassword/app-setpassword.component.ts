/**
 * SetPasswordComponent
 *
 * Componente encargado del restablecimiento de contraseñas.
 * Permite al usuario establecer una nueva contraseña a través de un token recibido por correo electrónico.
 *
 * Responsabilidades principales:
 * - Capturar el token de restablecimiento desde la URL.
 * - Validar el token y la nueva contraseña.
 * - Enviar la solicitud al backend para actualizar la contraseña del usuario.
 * - Mostrar mensajes de éxito o error según el resultado.
 *
 * @property {string} newPassword - Nueva contraseña ingresada por el usuario.
 * @property {string} token - Token de recuperación obtenido desde la URL.
 * @property {string} message - Mensaje mostrado cuando el cambio de contraseña es exitoso.
 * @property {string} errorMessage - Mensaje mostrado cuando ocurre un error en el proceso.
 * @property {boolean} isSubmitting - Indica si la solicitud de cambio de contraseña está en curso.
 */

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

  /** Nueva contraseña ingresada por el usuario */
  newPassword = '';

  /** Token de restablecimiento obtenido desde la URL */
  token = '';

  /** Mensaje mostrado al completar el proceso correctamente */
  message = '';

  /** Mensaje mostrado cuando ocurre un error durante el proceso */
  errorMessage = '';

  /** Indica si la solicitud de cambio de contraseña está en proceso */
  isSubmitting = false;

  /**
   * Constructor del componente.
   * Inyecta los servicios necesarios para capturar parámetros de la URL, navegación y lógica de autenticación.
   *
   * @param {ActivatedRoute} route - Servicio para acceder a los parámetros de la ruta activa.
   * @param {Router} router - Servicio de enrutamiento de Angular.
   * @param {LoginService} loginService - Servicio encargado de las operaciones de autenticación y gestión de usuarios.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService
  ) { }

  /**
   * Inicializa el componente.
   * Captura el token de la URL, lo limpia si es necesario y valida su existencia.
   *
   * @returns {void}
   */
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

  /**
   * Envía la nueva contraseña al backend para restablecer la cuenta del usuario.
   * 
   * Valida la existencia del token antes de enviar la solicitud.
   * Muestra mensajes de éxito o error según la respuesta del servidor.
   *
   * @returns {void}
   */
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

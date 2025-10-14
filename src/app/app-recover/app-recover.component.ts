import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

/**
 * AppRecoverComponent
 *
 * Componente encargado del proceso de recuperación de contraseña.
 * Permite al usuario ingresar su correo electrónico y solicitar el envío
 * de un enlace o instrucciones para restablecer su contraseña.
 *
 * Responsabilidades principales:
 * - Validar el correo electrónico ingresado.
 * - Enviar la solicitud de recuperación al servicio de autenticación (`LoginService`).
 * - Mostrar mensajes de éxito o error según la respuesta del backend.
 *
 * @property {string} email - Correo electrónico ingresado por el usuario.
 * @property {boolean} isLoading - Indica si se está procesando la solicitud.
 * @property {string} successMessage - Mensaje mostrado cuando el correo se envía correctamente.
 * @property {string} errorMessage - Mensaje mostrado cuando ocurre un error durante la recuperación.
 */

@Component({
  selector: 'app-app-recover',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app-recover.component.html',
  styleUrls: ['./app-recover.component.css']
})
export class AppRecoverComponent {

  /** Correo electrónico ingresado por el usuario */
  email = '';

  /** Indica si la solicitud de recuperación está en curso */
  isLoading = false;

  /** Mensaje mostrado cuando la recuperación se realiza exitosamente */
  successMessage = '';

  /** Mensaje mostrado cuando ocurre un error al intentar recuperar la contraseña */
  errorMessage = '';

  /**
   * Constructor del componente.
   * Inyecta los servicios necesarios para la navegación y autenticación.
   *
   * @param {Router} router - Servicio de enrutamiento de Angular.
   * @param {LoginService} loginService - Servicio encargado de la lógica de autenticación y recuperación de contraseñas.
   */
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  /**
   * Envía la solicitud de recuperación de contraseña al backend.
   * 
   * Valida el campo de correo electrónico antes de enviar la solicitud.
   * Si la operación es exitosa, muestra un mensaje de confirmación;
   * en caso contrario, muestra un mensaje de error.
   *
   * @returns {void}
   */
  onSubmit(): void {
    // Limpia mensajes previos
    this.successMessage = '';
    this.errorMessage = '';

    // Validación básica del correo
    if (!this.email) {
      this.errorMessage = 'Por favor ingresa un correo válido.';
      return;
    }

    // Muestra indicador de carga
    this.isLoading = true;

    // Llama al servicio de recuperación de contraseña
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

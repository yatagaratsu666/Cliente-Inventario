import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import User from '../domain/user.model';

/**
 * AppLoginComponent
 *
 * Componente Angular para manejar el inicio de sesión de usuarios.
 * Se encarga de:
 * - Mostrar un formulario de login con usuario y contraseña
 * - Validar que ambos campos estén diligenciados antes de enviar
 * - Invocar el servicio de autenticación (`LoginService`) para validar credenciales
 * - Manejar mensajes de error cuando la autenticación falla
 * - Redirigir al usuario a la vista de gestión si el login es exitoso
 *
 * Características:
 * - Uso de `FormsModule` para el manejo del formulario
 * - Uso de `Router` para la navegación posterior al login
 * - Feedback de error dinámico con `errorMessage`
 *
 * @property {string} username Nombre de usuario ingresado
 * @property {string} password Contraseña ingresada
 * @property {string} errorMessage Mensaje de error a mostrar en caso de fallo en el login
 */
@Component({
  selector: 'app-app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-login.component.html',
  styleUrl: './app-login.component.css'
})
export class AppLoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  /**
   * onSubmit
   *
   * Valida los campos del formulario de login y realiza la autenticación.
   * Si el login es exitoso, redirige al panel de gestión.
   * Si falla, muestra el mensaje de error recibido.
   *
   * @returns {void}
   */
  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor ingresa usuario y contraseña.';
      return;
    }

    this.loginService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/battles']); // Aqui va el if :3
      },
      error: (err) => {
        console.error('Error during login:', err);
        this.errorMessage = err.message;
      }
    });
  }
}

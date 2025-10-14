

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { ApiConfigService } from '../services/api.config.service';

/**
 * RegisterComponent
 *
 * Componente encargado del registro de nuevos usuarios en la aplicación.
 * Permite ingresar los datos personales, validar contraseñas y subir un avatar.
 *
 * Responsabilidades principales:
 * - Validar la información del formulario de registro.
 * - Validar el tipo y tamaño del archivo de avatar.
 * - Enviar los datos al servicio de registro (`LoginService`).
 * - Redirigir al usuario a la pantalla de inicio de sesión una vez registrado.
 *
 * @property {string} firstName - Nombre del usuario.
 * @property {string} lastName - Apellido del usuario.
 * @property {string} username - Apodo o nombre de usuario.
 * @property {string} email - Correo electrónico del usuario.
 * @property {string} password - Contraseña elegida.
 * @property {string} confirmPassword - Confirmación de la contraseña.
 * @property {File | undefined} avatarFile - Archivo seleccionado como avatar.
 * @property {boolean} isLoading - Indica si el proceso de registro está en curso.
 * @property {string} errorMessage - Mensaje de error mostrado en pantalla.
 * @property {string} apiUrl - URL base del endpoint de usuarios.
 */

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  /** Nombre del usuario */
  firstName: string = '';

  /** Apellido del usuario */
  lastName: string = '';

  /** Apodo o nombre de usuario */
  username: string = '';

  /** Correo electrónico */
  email: string = '';

  /** Contraseña del usuario */
  password: string = '';

  /** Confirmación de la contraseña */
  confirmPassword: string = '';

  /** Archivo seleccionado como avatar */
  avatarFile?: File;

  /** Indica si hay un proceso de registro en curso */
  isLoading: boolean = false;

  /** Mensaje de error mostrado al usuario */
  errorMessage: string = '';

  /** URL base del endpoint de usuarios */
  private apiUrl: string;

  /**
   * Constructor del componente.
   * @param {Router} router Servicio de enrutamiento de Angular.
   * @param {LoginService} loginService Servicio para manejar autenticación y registro.
   * @param {ApiConfigService} apiConfig Servicio que proporciona las URLs base del backend.
   */
  constructor(
    private router: Router,
    private loginService: LoginService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUsersUrl();
  }

  /**
   * Maneja la selección de archivos de avatar.
   * Valida el tipo de archivo (PNG, JPG, JPEG) y su tamaño (máximo 5 MB).
   * 
   * @param {Event} event - Evento emitido por el input de tipo "file".
   * @returns {void}
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.avatarFile = input.files[0];

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(this.avatarFile.type)) {
        this.errorMessage = 'Por favor selecciona un archivo PNG, JPG o JPEG';
        this.avatarFile = undefined;
        input.value = '';
        return;
      }

      if (this.avatarFile.size > 5 * 1024 * 1024) {
        this.errorMessage = 'El archivo es demasiado grande. Máximo 5MB';
        this.avatarFile = undefined;
        input.value = '';
        return;
      }

      this.errorMessage = '';
    } else {
      this.avatarFile = undefined;
    }
  }

  /**
   * Envía los datos del formulario de registro al servicio de autenticación.
   * Valida la existencia del avatar antes de realizar la solicitud.
   * Redirige al usuario al login en caso de éxito.
   * 
   * @returns {Promise<void>}
   */
  async onRegister(): Promise<void> {
    if (!this.avatarFile) {
      this.errorMessage = 'Por favor selecciona un avatar';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData = {
      nombres: this.firstName,
      apellidos: this.lastName,
      apodo: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      acceptTerms: true
    };

    this.loginService.registerUser(userData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error registrando usuario:', error);
        this.errorMessage = error.message?.includes('Registro principal')
          ? 'El servidor principal no pudo registrar el usuario.'
          : 'Error durante el registro. Por favor intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Obtiene la extensión del archivo seleccionado.
   * 
   * @private
   * @param {string} filename - Nombre del archivo.
   * @returns {string} Extensión del archivo en minúsculas.
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Sube el archivo de avatar al almacenamiento en la nube (GCS).
   * 
   * @private
   * @param {string} uploadUrl - URL de subida generada por el backend.
   * @param {File} file - Archivo a subir.
   * @throws Error si la carga no es exitosa.
   * @returns {Promise<void>}
   */
  private async uploadAvatarToGCS(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {}
    });

    if (!response.ok) {
      throw new Error(`Error subiendo archivo: ${response.status} ${response.statusText}`);
    }
  }
}

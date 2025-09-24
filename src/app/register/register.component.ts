import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { ApiConfigService } from '../services/api.config.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  username = '';
  email = '';
  password = '';
  avatarFile?: File;
  isLoading = false;
  errorMessage = '';

  private apiUrl: string;

  constructor(
    private router: Router, 
    private loginService: LoginService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUsersUrl();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.avatarFile = input.files[0];
      
      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(this.avatarFile.type)) {
        this.errorMessage = 'Por favor selecciona un archivo PNG, JPG o JPEG';
        this.avatarFile = undefined;
        input.value = '';
        return;
      }
      
      // Validar tamaño (ej: máximo 5MB)
      if (this.avatarFile.size > 5 * 1024 * 1024) {
        this.errorMessage = 'El archivo es demasiado grande. Máximo 5MB';
        this.avatarFile = undefined;
        input.value = '';
        return;
      }
      
      this.errorMessage = ''; // Limpiar errores si el archivo es válido
    } else {
      this.avatarFile = undefined;
    }
  }

  async onRegister() {
    if (!this.avatarFile) {
      this.errorMessage = 'Por favor selecciona un avatar';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 1. Obtener URL de subida para el avatar
      const fileExtension = this.getFileExtension(this.avatarFile.name);
      const uploadUrlResponse = await this.getUploadUrl(this.username, fileExtension);
      
      // 2. Subir el archivo a Google Cloud Storage
      await this.uploadAvatarToGCS(uploadUrlResponse.uploadUrl, this.avatarFile);
      
      // 3. Registrar el usuario con la URL pública del avatar
      const userData = {
        username: this.username,
        mail: this.email,
        password: this.password,
        names: this.firstName,
        surnames: this.lastName,
        urlAvatar: uploadUrlResponse.publicUrl,
        rolesIds: [] // Por defecto sin roles específicos
      };

      this.loginService.registerUser(userData).subscribe({
        next: (response) => {
          console.log('Usuario registrado exitosamente:', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error registrando usuario:', error);
          this.errorMessage = 'Error al registrar usuario. Por favor intenta de nuevo.';
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error('Error durante el registro:', error);
      this.errorMessage = 'Error durante el registro. Por favor intenta de nuevo.';
      this.isLoading = false;
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private async getUploadUrl(username: string, extension: string): Promise<{uploadUrl: string, publicUrl: string}> {
    const response = await fetch(`${this.apiUrl}/users/avatar/upload-url?username=${encodeURIComponent(username)}&extension=${extension}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo URL de subida: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private async uploadAvatarToGCS(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
      }
    });

    if (!response.ok) {
      throw new Error(`Error subiendo archivo: ${response.status} ${response.statusText}`);
    }
  }
}

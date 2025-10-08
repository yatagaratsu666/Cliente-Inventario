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
  confirmPassword = '';
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


      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(this.avatarFile.type)) {
        this.errorMessage = 'Por favor selecciona un archivo PNG, JPG o JPEG';
        this.avatarFile = undefined;
        input.value = '';
        return;
      }

      // tamaño máximo 5MB
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

  async onRegister() {
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
      next: (response) => {
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error registrando usuario:', error);

        this.errorMessage =
          error.message?.includes('Registro principal')
            ? 'El servidor principal no pudo registrar el usuario.'
            : 'Error durante el registro. Por favor intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }


  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
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

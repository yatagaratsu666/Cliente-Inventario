import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

onSubmit(): void {
  if (!this.username || !this.password) {
    this.errorMessage = 'Por favor ingresa usuario y contraseña.';
    return;
  }

  this.loginService.login(this.username, this.password).subscribe({
    next: () => {
      this.router.navigate(['/gestion']); // Redirige al panel
    },
    error: (err) => {
      this.errorMessage = err.message;
    }
  });
}

}

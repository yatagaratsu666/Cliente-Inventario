import { Component, Input, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import User from '../domain/user.model';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { AppLoginComponent } from '../app-login/app-login.component';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta-component.html',
  styleUrls: ['./cuenta-component.css'],
  imports: [CommonModule, AppLoginComponent],
})
export class CuentaComponent implements OnInit {
  user: User | null = null;
  username = localStorage.getItem('username') ?? '';
  role = localStorage.getItem('role') ?? '';
  @Input() isOpen = false;

  constructor(private userService: UsuarioService, private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    if (this.username) {
      this.userService.getUsuarioById(this.username).subscribe({
        next: (data) => {
          this.user = data;
        },
        error: (error) => {
          console.error('Error al cargar el usuario:', error);
        }
      });
    }
  }

  getNivel(): number {
  return Math.floor(this.user?.exp || 0 / 100);
}

  logout(): void {
    this.close();
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  close() {
    this.isOpen = false;
  }

  changeAvatar() {
    // vacio xq no se q hacer aqui :3
  }

}

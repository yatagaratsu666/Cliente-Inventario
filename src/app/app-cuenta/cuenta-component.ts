import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import User from '../domain/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta-component.html',
  styleUrls: ['./cuenta-component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CuentaComponent implements OnInit {
  user: User | null = null;
  username = localStorage.getItem('username') ?? '';
  role = localStorage.getItem('role') ?? '';

  constructor(private userService: UsuarioService) {}

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

getExpActual(): number {
  return (this.user?.exp || 0) % 100;
}

getExpProgreso(): number {
  return (this.getExpActual() / 100) * 100;
}

}

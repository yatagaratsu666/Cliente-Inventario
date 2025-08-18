import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Hero from '../../domain/heroe.model';
import { HeroesService } from '../../services/heroes.service';

@Component({
  selector: 'app-app-gestion-heroe',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './app-gestion-heroe.component.html',
  styleUrl: './app-gestion-heroe.component.css'
})
export class AppGestionHeroeComponent {
  heros: Hero[] = [];

  constructor(private router: Router, private heroService: HeroesService) {}

  ngOnInit(): void {
    this.showHeros();
  }

  showHeros(): void {
    this.heroService.showAllIHeros().subscribe({
      next: (data) => {
        this.heros = data;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        alert('No se pudo obtener la lista de items.');
      },
    });
  }

  addHero(): void {
    this.router.navigate(['/heroes/create']);
  }

  changeStatus(id: number): void {
    this.heroService.changeStatus(id).subscribe({
      next: () => {
        const item = this.heros.find((i) => i.id === id);
        if (item) {
          item.status = !item.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del item:', error);
        alert('No se pudo cambiar el estado del item.');
      },
    });
  }

  modifyHero(id: number): void {
    this.router.navigate(['/heroes/modify', id]);
  }
}

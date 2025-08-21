import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Epic } from '../../domain/epic.model';
import { EpicsService } from '../../services/epics.service';

@Component({
  selector: 'app-app-gestion-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-epica.component.html',
  styleUrl: './app-gestion-epica.component.css'
})
export class AppGestionEpicaComponent {
  epic: Epic[] = [];

  constructor(private router: Router, private epicService: EpicsService) {}

  ngOnInit(): void {
    this.showEpics();
  }

  showEpics(): void {
    this.epicService.showAllIEpics().subscribe({
      next: (data) => {
        this.epic = data;
      },
      error: (error) => {
        console.error('Error al cargar epicas:', error);
        alert('No se pudo obtener la lista de epicas.');
      },
    });
  }

  changeStatus(id: number): void {
    this.epicService.changeStatus(id).subscribe({
      next: () => {
        const weapon = this.epic.find((i) => i.id === id);
        if (weapon) {
          weapon.status = !weapon.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la epica:', error);
        alert('No se pudo cambiar el estado de la epica.');
      },
    });
  }

  modifyEpic(id: number): void {
    this.router.navigate(['/epics/modify', id]);
  }
}

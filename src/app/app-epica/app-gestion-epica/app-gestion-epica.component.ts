import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Epic } from '../../domain/epic.model';
import { EpicsService } from '../../services/epics.service';

/**
 * Componente encargado de la gestión de épicas dentro del sistema.
 * Permite listar, crear, modificar y cambiar el estado de las épicas
 * registradas en el backend.
 *
 * Características principales:
 * - Obtiene todas las épicas mediante el servicio `EpicsService`.
 * - Permite navegar hacia la creación o modificación de épicas.
 * - Cambia el estado (activo/inactivo) de una épica.
 */

@Component({
  selector: 'app-app-gestion-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-epica.component.html',
  styleUrl: './app-gestion-epica.component.css'
})
export class AppGestionEpicaComponent {
  // Lista de épicas traídas desde el backend
  epic: Epic[] = [];

  constructor(private router: Router, private epicService: EpicsService) {}

    /**
   * Llama a la función para cargar las épicas al iniciar el componente.
   */
  ngOnInit(): void {
    this.showEpics();
  }

    /**
   * Navega hacia la vista de creación de épicas.
   */
  addEpic(): void {
    this.router.navigate(['/epics/create']);
  }

    /**
   * Obtiene la lista completa de épicas desde el backend
   * y la asigna a la propiedad `epics`.
   */
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

    /**
   * Cambia el estado (activo/inactivo) de una épica específica.
   * @param id ID de la épica cuyo estado se modificará.
   */
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

    /**
   * Navega hacia la vista de modificación de una épica.
   * @param id ID de la épica a modificar.
   */
  modifyEpic(id: number): void {
    this.router.navigate(['/epics/modify', id]);
  }
}

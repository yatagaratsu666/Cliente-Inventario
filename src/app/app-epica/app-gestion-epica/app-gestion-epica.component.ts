import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Epic } from '../../domain/epic.model';
import { EpicsService } from '../../services/epics.service';

/**
 * AppGestionEpicaComponent
 *
 * Componente Angular encargado de gestionar la lista de épicas en el sistema.
 * Permite listar, crear, modificar y cambiar el estado de las épicas registradas
 * en el backend.
 *
 * @property {Epic[]} epic - Lista de épicas obtenidas desde el backend.
 */
@Component({
  selector: 'app-app-gestion-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-epica.component.html',
  styleUrl: './app-gestion-epica.component.css'
})
export class AppGestionEpicaComponent {
  epic: Epic[] = [];

  constructor(private router: Router, private epicService: EpicsService) {}

  /**
   * Inicializa el componente y carga las épicas disponibles.
   */
  ngOnInit(): void {
    this.showEpics();
  }

  /**
   * Redirige a la vista de creación de una nueva épica.
   */
  addEpic(): void {
    this.router.navigate(['/epics/create']);
  }

  /**
   * Obtiene todas las épicas desde el backend y las asigna a la propiedad `epic`.
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
   *
   * @param {number} id - ID de la épica cuyo estado se desea modificar.
   */
  changeStatus(id: number): void {
    this.epicService.changeStatus(id).subscribe({
      next: () => {
        const epicItem = this.epic.find((i) => i.id === id);
        if (epicItem) {
          epicItem.status = !epicItem.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la epica:', error);
        alert('No se pudo cambiar el estado de la epica.');
      },
    });
  }

  /**
   * Redirige a la vista de modificación de una épica existente.
   *
   * @param {number} id - ID de la épica que se desea modificar.
   */
  modifyEpic(id: number): void {
    this.router.navigate(['/epics/modify', id]);
  }
}

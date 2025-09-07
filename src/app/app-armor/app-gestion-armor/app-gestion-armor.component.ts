import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Armor } from '../../domain/armor.model';
import { ArmorsService } from '../../services/armors.service';

/**
 * AppGestionArmorComponent
 *
 * Componente Angular encargado de la gestión de armaduras.
 * Permite visualizar, crear, modificar y cambiar el estado de armaduras registradas.
 *
 * @property {Armor[]} armor - Lista de armaduras obtenidas desde el backend.
 */
@Component({
  selector: 'app-app-gestion-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-armor.component.html',
  styleUrl: './app-gestion-armor.component.css'
})
export class AppGestionArmorComponent {
  /** Lista de armaduras que se mostrarán en pantalla */
  armor: Armor[] = [];

  constructor(private router: Router, private armorService: ArmorsService) {}

  /**
   * Inicializa el componente y carga todas las armaduras.
   */
  ngOnInit(): void {
    this.showArmors();
  }

  /**
   * Redirige al formulario de creación de una nueva armadura.
   */
  addArmor(): void {
    this.router.navigate(['/armors/create']);
  }

  /**
   * Obtiene todas las armaduras desde el backend y las asigna a la lista local.
   */
  showArmors(): void {
    this.armorService.showAllIArmors().subscribe({
      next: (data) => {
        this.armor = data;
      },
      error: (error) => {
        console.error('Error al cargar armaduras:', error);
        alert('No se pudo obtener la lista de armaduras.');
      },
    });
  }

  /**
   * Cambia el estado (activo/inactivo) de una armadura específica.
   * @param {number} id - ID de la armadura cuyo estado se modificará.
   */
  changeStatus(id: number): void {
    this.armorService.changeStatus(id).subscribe({
      next: () => {
        const armor = this.armor.find((i) => i.id === id);
        if (armor) {
          armor.status = !armor.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la armadura:', error);
        alert('No se pudo cambiar el estado de la armadura.');
      },
    });
  }

  /**
   * Redirige al formulario de modificación de una armadura existente.
   * @param {number} id - ID de la armadura a modificar.
   */
  modifyArmor(id: number): void {
    this.router.navigate(['/armors/modify', id]);
  }
}

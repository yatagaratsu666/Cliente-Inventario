import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * AppGestionWeaponComponent
 *
 * Componente Angular para gestionar el listado de armas.
 * Se encarga de:
 * - Cargar todas las armas desde el backend
 * - Mostrar el listado de armas existentes
 * - Permitir cambiar el estado (activo/inactivo) de un arma
 * - Navegar hacia la creación de nuevas armas
 * - Navegar hacia la edición de armas existentes
 *
 * Características:
 * - Uso de `WeaponsService` para interactuar con la API
 * - Uso de `Router` para navegación entre vistas
 * - Manejo básico de errores con alertas y console.error
 * - Arquitectura basada en componentes standalone (usa imports propios)
 *
 * @property {Weapon[]} weapon Lista de armas cargadas desde el backend
 */
@Component({
  selector: 'app-app-gestion-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-weapon.component.html',
  styleUrl: './app-gestion-weapon.component.css'
})
export class AppGestionWeaponComponent {
  weapon: Weapon[] = [];

  constructor(private router: Router, private weaponService: WeaponsService) {}

  /**
   * Inicializa el componente cargando todas las armas disponibles al iniciar la vista.
   * @returns {void}
   */
  ngOnInit(): void {
    this.showWeapons();
  }

  /**
   * Navega a la vista para crear una nueva arma.
   * @returns {void}
   */
  addWeapon(): void {
    this.router.navigate(['/weapons/create']);
  }

  /**
   * Obtiene todas las armas desde el backend.
   * Maneja errores mostrando un mensaje en consola y alerta al usuario.
   * @returns {void}
   */
  showWeapons(): void {
    this.weaponService.showAllIWeapon().subscribe({
      next: (data) => {
        this.weapon = data;
      },
      error: (error) => {
        console.error('Error al cargar armas:', error);
        alert('No se pudo obtener la lista de armas.');
      },
    });
  }

  /**
   * Cambia el estado (activo/inactivo) de un arma según su ID.
   * @param {number} id ID del arma a modificar
   * @returns {void}
   */
  changeStatus(id: number): void {
    this.weaponService.changeStatus(id).subscribe({
      next: () => {
        const weapon = this.weapon.find((i) => i.id === id);
        if (weapon) {
          weapon.status = !weapon.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del arma:', error);
        alert('No se pudo cambiar el estado del arma.');
      },
    });
  }

  /**
   * Navega a la vista para modificar un arma existente.
   * @param {number} id ID del arma a modificar
   * @returns {void}
   */
  modifyWeapon(id: number): void {
    this.router.navigate(['/weapons/modify', id]);
  }
}

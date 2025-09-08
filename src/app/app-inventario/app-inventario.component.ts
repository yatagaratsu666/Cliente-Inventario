import { Component } from '@angular/core';

/**
 * AppInventarioComponent
 *
 * Componente que gestiona el inventario del jugador:
 * - Muestra los ítems equipados.
 * - Permite equipar ítems.
 * - Administra la paginación de los ítems disponibles.
 * 
 * Propiedades:
 * - `itemsDisponibles`: Lista de ítems.
 * - `itemsPerPage`: Ítems por página.
 * - `currentPage`: Página actual.
 * - `armaEquipada`, `armaduraEquipada`, `itemEquipado`, `epicaEquipada`: Ítems equipados.
 */
@Component({
  selector: 'app-inventario',
  templateUrl: './app-inventario.component.html',
  styleUrls: ['./app-inventario.component.css']
})
export class AppInventarioComponent {
  
  // Información de los ítems equipados
  armaEquipada = 'Espada de fuego'; 
  armaduraEquipada = 'Armadura de hierro'; 
  itemEquipado = 'Pociones de vida'; 
  epicaEquipada = 'Escudo del dragón'; 

  // Lista de ítems disponibles (estáticos para este ejemplo)
  itemsDisponibles = [
    { nombre: 'Espada de fuego', tipo: 'arma' },
    { nombre: 'Armadura de hierro', tipo: 'armadura' },
    { nombre: 'Pociones de vida', tipo: 'item' },
    { nombre: 'Escudo del dragón', tipo: 'epica' },
    { nombre: 'Espada de hielo', tipo: 'arma' },
    { nombre: 'Armadura de acero', tipo: 'armadura' },
    { nombre: 'Pociones de mana', tipo: 'item' },
    { nombre: 'Escudo de fuego', tipo: 'epica' },
    { nombre: 'Espada mágica', tipo: 'arma' },
    { nombre: 'Armadura de plata', tipo: 'armadura' }
  ];

  // Paginación
  itemsPerPage = 8;
  currentPage = 1;

  /**
   * Obtiene los ítems correspondientes a la página actual de la paginación.
   * Utiliza el número de página actual y el número de ítems por página
   * para devolver una lista paginada de ítems.
   */
  get paginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.itemsDisponibles.slice(start, end);
  }

  /**
   * Cambia la página a la siguiente, incrementando el valor de `currentPage`.
   * Asegura que no se exceda el número total de ítems.
   */
  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.itemsDisponibles.length) {
      this.currentPage++;
    }
  }

  /**
   * Cambia la página a la anterior, decrementando el valor de `currentPage`.
   * Asegura que no se disminuya más allá de la página 1.
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Función para equipar un ítem del inventario.
   * Dependiendo del tipo de ítem (arma, armadura, item, épica),
   * se asigna el nombre del ítem a la propiedad correspondiente.
   * 
   * @param item El ítem a equipar.
   */
  equiparItem(item: any) {
    if (item.tipo === 'arma') {
      this.armaEquipada = item.nombre;
    } else if (item.tipo === 'armadura') {
      this.armaduraEquipada = item.nombre;
    } else if (item.tipo === 'item') {
      this.itemEquipado = item.nombre;
    } else if (item.tipo === 'epica') {
      this.epicaEquipada = item.nombre;
    }
  }
}



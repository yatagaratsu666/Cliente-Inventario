import { Component } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';
import User from '../domain/user.model';
import { CommonModule } from '@angular/common';

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
  styleUrls: ['./app-inventario.component.css'],
  imports: [CommonModule]
})
export class AppInventarioComponent {
  user: User = new User();
  userId: string = localStorage.getItem('username') || '';
  message = '';

  constructor(private userService: UsuarioService, private router: Router) {}
  

  ngOnInit(): void {
    this.showInventory();
  }

itemsPorPagina = 8;

paginaArmas = 1;
paginaArmaduras = 1;
paginaItems = 1;
paginaEpicas = 1;
paginaHeroes = 1;

selectedCategory: string = 'armas';

setCategory(cat: string) {
  this.selectedCategory = cat;
}

get armasDisponiblesPaginados() {
  const start = (this.paginaArmas - 1) * this.itemsPorPagina;
  return this.user.inventario.weapons.slice(start, start + this.itemsPorPagina);
}

get armadurasDisponiblesPaginados() {
  const start = (this.paginaArmaduras - 1) * this.itemsPorPagina;
  return this.user.inventario.armors.slice(start, start + this.itemsPorPagina);
}

get itemsDisponiblesPaginados() {
  const start = (this.paginaItems - 1) * this.itemsPorPagina;
  return this.user.inventario.items.slice(start, start + this.itemsPorPagina);
}

get epicasDisponiblesPaginados() {
  const start = (this.paginaEpicas - 1) * this.itemsPorPagina;
  return this.user.inventario.epicAbility.slice(start, start + this.itemsPorPagina);
}

get heroesDisponiblesPaginados() {
  const start = (this.paginaHeroes - 1) * this.itemsPorPagina;
  return this.user.inventario.hero.slice(start, start + this.itemsPorPagina);
}

cambiarPagina(cat: string, dir: number) {
  if (cat === 'armas') {
    const max = Math.ceil(this.user.inventario.weapons.length / this.itemsPorPagina);
    this.paginaArmas = Math.min(Math.max(1, this.paginaArmas + dir), max);
  }
  if (cat === 'armaduras') {
    const max = Math.ceil(this.user.inventario.armors.length / this.itemsPorPagina);
    this.paginaArmaduras = Math.min(Math.max(1, this.paginaArmaduras + dir), max);
  }
  if (cat === 'items') {
    const max = Math.ceil(this.user.inventario.items.length / this.itemsPorPagina);
    this.paginaItems = Math.min(Math.max(1, this.paginaItems + dir), max);
  }
  if (cat === 'epicas') {
    const max = Math.ceil(this.user.inventario.epicAbility.length / this.itemsPorPagina);
    this.paginaEpicas = Math.min(Math.max(1, this.paginaEpicas + dir), max);
  }

  if (cat === 'heroes') {
    const max = Math.ceil(this.user.inventario.epicAbility.length / this.itemsPorPagina);
    this.paginaHeroes = Math.min(Math.max(1, this.paginaEpicas + dir), max);
  }
}

  showInventory(): void{
     this.userService.getUsuarioById(this.userId).subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        alert('No se pudo obtener la lista de items.');
      },
    });
  }

  equipItem(itemName: string): void {
    this.userService.equipItem(this.userId, itemName).subscribe({
      next: () => {
        this.message = `Ítem ${itemName} equipado con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar item:', err);
        this.message = `No se pudo equipar el ítem ${itemName}.`;
      }
    });
  }

  equipHero(heroName: string): void {
    this.userService.equipHero(this.userId, heroName).subscribe({
      next: () => {
        this.message = `heroe ${heroName} equipado con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar heroe:', err);
        this.message = `No se pudo equipar el heroe ${heroName}.`;
      }
    });
  }

    equipWeapon(weaponName: string): void {
    this.userService.equipWeapon(this.userId, weaponName).subscribe({
      next: () => {
        this.message = `Arma ${weaponName} equipada con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar arma:', err);
        this.message = `No se pudo equipar el arma ${weaponName}.`;
      }
    });
  }

  /** Equipar una armadura */
  equipArmor(armorName: string): void {
    this.userService.equipArmor(this.userId, armorName).subscribe({
      next: () => {
        this.message = `Armadura ${armorName} equipada con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar armadura:', err);
        this.message = `No se pudo equipar la armadura ${armorName}.`;
      }
    });
  }

  /** Equipar una épica */
  equipEpic(epicName: string): void {
    this.userService.equipEpic(this.userId, epicName).subscribe({
      next: () => {
        this.message = `Épica ${epicName} equipada con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar épica:', err);
        this.message = `No se pudo equipar la épica ${epicName}.`;
      }
    });
  }

  unequipItem(itemName: string): void {
    this.userService.unequipItem(this.userId, itemName).subscribe({
      next: () => {
        this.message = `Ítem ${itemName} quitado con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar item:', err);
        this.message = `No se pudo equipar el ítem ${itemName}.`;
      }
    });
  }

  unequipHero(heroName: string): void {
    this.userService.unequipHero(this.userId, heroName).subscribe({
      next: () => {
        this.message = `heroe ${heroName} quitado con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar heroe:', err);
        this.message = `No se pudo equipar el heroe ${heroName}.`;
      }
    });
  }

  unequipWeapon(weaponName: string): void {
    this.userService.unequipWeapon(this.userId, weaponName).subscribe({
      next: () => {
        this.message = `Arma ${weaponName} quitado con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar arma:', err);
        this.message = `No se pudo equipar el arma ${weaponName}.`;
      }
    });
  }

  /** Equipar una armadura */
  unequipArmor(armorName: string): void {
    this.userService.unequipArmor(this.userId, armorName).subscribe({
      next: () => {
        this.message = `Armadura ${armorName} quitado con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar armadura:', err);
        this.message = `No se pudo equipar la armadura ${armorName}.`;
      }
    });
  }

  unequipEpic(epicName: string): void {
    this.userService.unequipEpic(this.userId, epicName).subscribe({
      next: () => {
        this.message = `Épica ${epicName} quitado con éxito.`;
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar épica:', err);
        this.message = `No se pudo equipar la épica ${epicName}.`;
      }
    });
  }
}



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
  imports: [CommonModule],
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

  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' = 'success';

  showVisualAlert(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = null;
    }, 3500); // Oculta después de 3.5s
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }

  get armasDisponiblesPaginados() {
    const start = (this.paginaArmas - 1) * this.itemsPorPagina;
    return this.user.inventario.weapons.slice(
      start,
      start + this.itemsPorPagina
    );
  }

  get armadurasDisponiblesPaginados() {
    const start = (this.paginaArmaduras - 1) * this.itemsPorPagina;
    return this.user.inventario.armors.slice(
      start,
      start + this.itemsPorPagina
    );
  }

  get itemsDisponiblesPaginados() {
    const start = (this.paginaItems - 1) * this.itemsPorPagina;
    return this.user.inventario.items.slice(start, start + this.itemsPorPagina);
  }

  get epicasDisponiblesPaginados() {
    const start = (this.paginaEpicas - 1) * this.itemsPorPagina;
    return this.user.inventario.epicAbility.slice(
      start,
      start + this.itemsPorPagina
    );
  }

  get heroesDisponiblesPaginados() {
    const start = (this.paginaHeroes - 1) * this.itemsPorPagina;
    return this.user.inventario.hero.slice(start, start + this.itemsPorPagina);
  }

  cambiarPagina(cat: string, dir: number) {
    if (cat === 'armas') {
      const max = Math.ceil(
        this.user.inventario.weapons.length / this.itemsPorPagina
      );
      this.paginaArmas = Math.min(Math.max(1, this.paginaArmas + dir), max);
    }
    if (cat === 'armaduras') {
      const max = Math.ceil(
        this.user.inventario.armors.length / this.itemsPorPagina
      );
      this.paginaArmaduras = Math.min(
        Math.max(1, this.paginaArmaduras + dir),
        max
      );
    }
    if (cat === 'items') {
      const max = Math.ceil(
        this.user.inventario.items.length / this.itemsPorPagina
      );
      this.paginaItems = Math.min(Math.max(1, this.paginaItems + dir), max);
    }
    if (cat === 'epicas') {
      const max = Math.ceil(
        this.user.inventario.epicAbility.length / this.itemsPorPagina
      );
      this.paginaEpicas = Math.min(Math.max(1, this.paginaEpicas + dir), max);
    }

    if (cat === 'heroes') {
      const max = Math.ceil(
        this.user.inventario.epicAbility.length / this.itemsPorPagina
      );
      this.paginaHeroes = Math.min(Math.max(1, this.paginaEpicas + dir), max);
    }
  }

  showInventory(): void {
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
    const currentItems = this.user.equipados.items || [];

    if (currentItems.length >= 2) {
      this.showVisualAlert(
        '⚠️ Solo puedes equipar 2 ítems. Desequipa uno primero.',
        'warning'
      );
      return;
    }

    this.userService.equipItem(this.userId, itemName).subscribe({
      next: () => {
        this.showVisualAlert(
          `✅ Ítem ${itemName} equipado con éxito.`,
          'success'
        );
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar ítem:', err);
        this.showVisualAlert(
          `❌ No se pudo equipar el ítem ${itemName}.`,
          'error'
        );
      },
    });
  }

  equipHero(heroName: string): void {
    if (this.user.equipados.hero) {
      this.showVisualAlert(
        '⚠️ Ya tienes un héroe equipado. Desequipa el actual primero.',
        'warning'
      );
      return;
    }

    this.userService.equipHero(this.userId, heroName).subscribe({
      next: () => {
        this.showVisualAlert(
          `🛡️ Héroe ${heroName} equipado con éxito.`,
          'success'
        );
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar héroe:', err);
        this.showVisualAlert(
          `❌ No se pudo equipar el héroe ${heroName}.`,
          'error'
        );
      },
    });
  }

  equipWeapon(weaponName: string): void {
    const currentWeapons = this.user.equipados.weapons || [];

    if (currentWeapons.length >= 2) {
      this.showVisualAlert(
        '⚠️ Solo puedes equipar 2 armas. Desequipa una primero.',
        'warning'
      );
      return;
    }

    this.userService.equipWeapon(this.userId, weaponName).subscribe({
      next: () => {
        this.showVisualAlert(
          `🔪 Arma ${weaponName} equipada con éxito.`,
          'success'
        );
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar arma:', err);
        this.showVisualAlert(
          `❌ No se pudo equipar el arma ${weaponName}.`,
          'error'
        );
      },
    });
  }

  equipArmor(armorName: string): void {
    const currentArmors = this.user.equipados.armors || [];

    if (currentArmors.length >= 6) {
      this.showVisualAlert(
        '⚠️ Ya tienes 6 piezas de armadura equipadas. Desequipa una primero.',
        'warning'
      );
      return;
    }

    this.userService.equipArmor(this.userId, armorName).subscribe({
      next: () => {
        this.showVisualAlert(
          `🛡️ Armadura ${armorName} equipada con éxito.`,
          'success'
        );
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar armadura:', err);
        this.showVisualAlert(
          `❌ No se pudo equipar la armadura ${armorName}.`,
          'error'
        );
      },
    });
  }

  equipEpic(epicName: string): void {
    const currentEpics = this.user.equipados.epicAbility || [];

    if (currentEpics.length >= 1) {
      this.showVisualAlert(
        '⚠️ Solo puedes equipar 1 habilidad épica a la vez.',
        'warning'
      );
      return;
    }

    this.userService.equipEpic(this.userId, epicName).subscribe({
      next: () => {
        this.showVisualAlert(
          `✨ Épica ${epicName} equipada con éxito.`,
          'success'
        );
        this.showInventory();
      },
      error: (err) => {
        console.error('Error al equipar épica:', err);
        this.showVisualAlert(
          `❌ No se pudo equipar la épica ${epicName}.`,
          'error'
        );
      },
    });
  }

unequipItem(itemName: string): void {
  this.userService.unequipItem(this.userId, itemName).subscribe({
    next: () => {
      this.showVisualAlert(`🧪 Ítem ${itemName} desequipado con éxito.`, 'success');
      this.showInventory();
    },
    error: (err) => {
      console.error('Error al desequipar item:', err);
      this.showVisualAlert(`❌ No se pudo desequipar el ítem ${itemName}.`, 'error');
    },
  });
}

unequipHero(heroName: string): void {
  this.userService.unequipHero(this.userId, heroName).subscribe({
    next: () => {
      this.showVisualAlert(`🦸‍♂️ Héroe ${heroName} desequipado con éxito.`, 'success');
      this.showInventory();
    },
    error: (err) => {
      console.error('Error al desequipar héroe:', err);
      this.showVisualAlert(`❌ No se pudo desequipar el héroe ${heroName}.`, 'error');
    },
  });
}

unequipWeapon(weaponName: string): void {
  this.userService.unequipWeapon(this.userId, weaponName).subscribe({
    next: () => {
      this.showVisualAlert(`🗡️ Arma ${weaponName} desequipada con éxito.`, 'success');
      this.showInventory();
    },
    error: (err) => {
      console.error('Error al desequipar arma:', err);
      this.showVisualAlert(`❌ No se pudo desequipar el arma ${weaponName}.`, 'error');
    },
  });
}

unequipArmor(armorName: string): void {
  this.userService.unequipArmor(this.userId, armorName).subscribe({
    next: () => {
      this.showVisualAlert(`🛡️ Armadura ${armorName} desequipada con éxito.`, 'success');
      this.showInventory();
    },
    error: (err) => {
      console.error('Error al desequipar armadura:', err);
      this.showVisualAlert(`❌ No se pudo desequipar la armadura ${armorName}.`, 'error');
    },
  });
}

unequipEpic(epicName: string): void {
  this.userService.unequipEpic(this.userId, epicName).subscribe({
    next: () => {
      this.showVisualAlert(`✨ Épica ${epicName} desequipada con éxito.`, 'success');
      this.showInventory();
    },
    error: (err) => {
      console.error('Error al desequipar épica:', err);
      this.showVisualAlert(`❌ No se pudo desequipar la épica ${epicName}.`, 'error');
    },
  });
}
}



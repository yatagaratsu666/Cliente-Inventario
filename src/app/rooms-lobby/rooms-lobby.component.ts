import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppChatComponent } from "../app-chat/app-chat.component";
import User from '../domain/user.model';
import { UsuarioService } from '../services/usuario.service';
import { Epic } from '../domain/epic.model';
import { Effect } from '../domain/effect.model';

/**
 * Componente Angular que gestiona el lobby de una sala de batalla (pre-combate).
 *
 * Funcionalidades principales:
 * - Obtiene el ID de la sala desde la URL.
 * - Carga las estadísticas del héroe del jugador.
 * - Escucha el evento `battleStarted` y redirige al componente de batalla.
 * - Permite que el jugador indique que está listo (`onReady`).
 * - Libera suscripciones en `ngOnDestroy` para evitar fugas de memoria.
 */
@Component({
  selector: 'app-room-lobby',
  templateUrl: './rooms-lobby.component.html',
  standalone: true,
  styleUrls: ['./rooms-lobby.component.css'],
  imports: [CommonModule, FormsModule, AppChatComponent]
})
export class RoomLobbyComponent implements OnInit, OnDestroy {
  message = '';
  /** ID de la sala actual extraído de la URL */
  roomId!: string;

  /** Lista de jugadores en la sala */
  players: any[] = [];

  /** Estadísticas del héroe del jugador actual */
  heroStats: any;

  /** ID del jugador actual (obtenido del localStorage) */
  userId: string = localStorage.getItem('username') || '';

  /** Equipo del jugador (puede ser 'A' o 'B') */
  team: string = 'A';

  // Nuevas propiedades para el equipamiento
  isReady: boolean = false;
  showEquipmentModal: boolean = false;
  selectedSlot: string = '';
  selectedItem: any = null;

  /** Suscripciones a observables para limpiar en ngOnDestroy */
  private subs: Subscription[] = [];
  battle: any;

  user: User = new User();

  firstCharge = true;

  equippedItems: any = {
    helmet: null,
    chest: null,
    gloves: null,
    bracerLeft: null,
    bracerRight: null,
    pants: null,
    shoes: null,
    weapon1: null,
    weapon2: null,
    item1: null,
    item2: null,
    epicSkill: null
  };

  /**
   * Constructor del componente.
   *
   * @param route - Servicio para acceder a parámetros de la ruta.
   * @param router - Servicio de enrutamiento Angular.
   * @param battleService - Servicio que maneja la lógica de batallas.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleService: BattleService,
    private userService: UsuarioService
  ) {}

  /**
   * Hook de inicialización del componente.
   * - Obtiene `roomId` desde la ruta.
   * - Recupera las estadísticas del héroe.
   * - Se suscribe al evento `battleStarted` para redirigir al campo de batalla.
   */
ngOnInit(): void {
  this.roomId = this.route.snapshot.paramMap.get('id') || '';

  const heroSub = this.battleService.getHeroStatsByPlayerId(this.userId).subscribe(hero => {
    this.heroStats = hero;
    console.log("Estadísticas del héroe cargadas:", this.heroStats);
    console.log("Nivel del héroe:", this.heroStats?.hero?.level);
    console.log("Tipo de héroe:", this.heroStats?.hero.heroType);
    console.log("maximo damage:", this.heroStats?.hero.damage.min)
    console.log("maximo damage:", this.heroStats?.hero.damage.max)
  });

  this.subs.push(heroSub);

  this.showInventory();

  const battleSub = this.battleService.listen<any>('battleStarted').subscribe(event => {
    this.battleService.setCurrentBattle(event);
    this.battleService.joinBattle(this.roomId, this.userId);
    this.router.navigate([`/battle/${this.roomId}`]);
  });

  this.subs.push(battleSub);
}

  showInventory(): void{
    this.userService.getUsuarioById(this.userId).subscribe({
      next: (data) => {
        this.user = data;
        this.equippedItems = {
          helmet: this.user.equipados.armors?.find((item) => item.armorType === 'HELMET') || null,
          chest: this.user.equipados.armors?.find((item) => item.armorType === 'CHEST') || null,
          gloves: this.user.equipados.armors?.find((item) => item.armorType === 'GLOVERS') || null,
          bracerLeft: this.user.equipados.armors?.find((item) => item.armorType === 'BRACERS') || null,
          bracerRight: this.user.equipados.armors?.find((item) => item.armorType === 'BRACERS') || null,
          pants: this.user.equipados.armors?.find((item) => item.armorType === 'PANTS') || null,
          shoes: this.user.equipados.armors?.find((item) => item.armorType === 'BOOTS') || null,
          weapon1: this.user.equipados.weapons?.[0] || null,
          weapon2: this.user.equipados.weapons?.[1] || null,
          item1: this.user.equipados.items?.[0] || null,
          item2: this.user.equipados.items?.[1] || null,
          epicSkill: this.user.equipados.epicAbility?.[0] || null
        };

        if (this.firstCharge) {
          for (let slot in this.equippedItems) {
            if (this.equippedItems[slot]) {
              const slotName = this.getSlotName(slot); // Convierte a español
              this.updateHeroStats(this.equippedItems[slot], true, slotName);
            }
          }
          this.firstCharge = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        alert('No se pudo obtener la lista de items.');
      },
    });
  }

  getImageByItemName(itemName: string): string | undefined {
  const sources = [
    ...(this.user.inventario.weapons || []),
    ...(this.user.inventario.armors || []),
    ...(this.user.inventario.items || []),
    ...(this.user.inventario.epicAbility || []),
    ...(this.user.equipados.weapons || []),
    ...(this.user.equipados.armors || []),
    ...(this.user.equipados.items || []),
    ...(this.user.equipados.epicAbility || [])
  ];

  const foundItem = sources.find(item => item?.name === itemName);
  return foundItem?.image;
}



  updateStats(effect: Effect, equip: boolean) {
    if (!this.heroStats?.hero) {
      console.log("No se pueden actualizar las estadísticas del héroe: heroStats o hero no definido");
      return;
    }
    const multiplier = equip ? 1 : -1;
    switch(effect.effectType){
      case "DAMAGE":
        this.heroStats.hero.damage.min += effect.value * multiplier;
        this.heroStats.hero.damage.max += effect.value * multiplier;
        break;
      case "HEAL":
        this.heroStats.hero.health += effect.value * multiplier;
        break;
      case "BOOST_ATTACK":
        this.heroStats.hero.attack += effect.value * multiplier;
        break;
      case "BOOST_DEFENSE":
        this.heroStats.hero.defense += effect.value * multiplier;
        break;
      case "DEFENSE":
        this.heroStats.hero.defense += effect.value * multiplier;
        break;
      default:
        console.log("Tipo de efecto no manejado:", effect.effectType);
        break;
    }
  }

  // Actualizar estadísticas del héroe basado en equipamiento
  updateHeroStats(itemName: string, equip: boolean, slot: string) {
    if (!this.heroStats?.hero) {
      console.log("No se pueden actualizar las estadísticas del héroe: heroStats o hero no definido");
      return;
    };
      switch(slot) {
      case 'Casco':
        const helmet = this.user.inventario.armors?.find(item => item.name === itemName) || this.user.equipados.armors?.find(item => item.name === itemName);
        if (helmet) {
          for (let effect of helmet.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Pecho':
        const chest = this.user.inventario.armors?.find(item => item.name === itemName) || this.user.equipados.armors?.find(item => item.name === itemName);
        if (chest) {
          for (let effect of chest.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Guantes':
        const gloves = this.user.inventario.armors?.find(item => item.name === itemName) || this.user.equipados.armors?.find(item => item.name === itemName);
        if (gloves) {
          for (let effect of gloves.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Brazalete Izquierdo':
        const bracerLeft = this.user.inventario.armors?.find(item => item.name === itemName) || this.user.equipados.armors?.find(item => item.name === itemName);
        if (bracerLeft) {
          for (let effect of bracerLeft.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Brazalete Derecho':
        const bracerRight = this.user.inventario.armors?.find(item => item.name === itemName) || this.user.equipados.armors?.find(item => item.name === itemName);
        if (bracerRight) {
          for (let effect of bracerRight.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Pantalón':
        const pants = this.user.inventario.armors?.find(item => item.name === itemName) || this.user.equipados.armors?.find(item => item.name === itemName);
        if (pants) {
          for (let effect of pants.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Zapatos':
        const boots = this.user.inventario.armors?.find(item => item.name === itemName) || this.user.equipados.armors?.find(item => item.name === itemName);
        if (boots) {
          for (let effect of boots.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Arma Principal':
        const weapon = this.user.inventario.weapons?.find(item => item.name === itemName) || this.user.equipados.weapons?.find(item => item.name === itemName);
        if (weapon) {
          for (let effect of weapon.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Arma Secundaria':
        const secondaryWeapon = this.user.inventario.weapons?.find(item => item.name === itemName) || this.user.equipados.weapons?.find(item => item.name === itemName);
        if (secondaryWeapon) {
          for (let effect of secondaryWeapon.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Item 1':
        const item1 = this.user.inventario.items?.find(item => item.name === itemName) || this.user.equipados.items?.find(item => item.name === itemName);
        if (item1) {
          for (let effect of item1.effects) {
            this.updateStats(effect, equip);
          }
        }

        break;
      case 'Item 2':
        const item2 = this.user.inventario.items?.find(item => item.name === itemName) || this.user.equipados.items?.find(item => item.name === itemName);
        if (item2) {
          for (let effect of item2.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Habilidad Épica':
        const epic = this.user.inventario.epicAbility?.find(item => item.name === itemName) || this.user.equipados.epicAbility?.find(item => item.name === itemName);
        if (epic) {
          for (let effect of epic.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      default:
        console.error('Slot desconocido:', slot);
        break;
        
    }
  }
  /**
   * Notifica al servidor que el jugador está listo para iniciar la batalla.
   */

  /**
   * Hook de destrucción del componente.
   * Libera todas las suscripciones a observables para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // Métodos para el modal de equipamiento
  openEquipmentModal(slot: string) {
    if (this.isReady) return; // No permitir cambios si ya está listo
    this.selectedSlot = this.getSlotName(slot);
    this.selectedItem = null;
    this.showEquipmentModal = true;
  }

  closeEquipmentModal() {
    this.showEquipmentModal = false;
    this.selectedSlot = '';
    this.selectedItem = null;
  }

  // Obtener nombre del slot en español
  getSlotName(slot: string): string {
    const slotNames: any = {
      helmet: 'Casco',
      chest: 'Pecho',
      gloves: 'Guantes',
      bracerLeft: 'Brazalete Izquierdo',
      bracerRight: 'Brazalete Derecho',
      pants: 'Pantalón',
      shoes: 'Zapatos',
      weapon1: 'Arma Principal',
      weapon2: 'Arma Secundaria',
      item1: 'Item 1',
      item2: 'Item 2',
      epicSkill: 'Habilidad Épica'
    };
    return slotNames[slot] || slot;
  }


  getSlotKey(slotName: string): string {
    const slotKeys: any = {
      'Casco': 'helmet',
      'Pecho': 'chest',
      'Guantes': 'gloves',
      'Brazalete Izquierdo': 'bracerLeft',
      'Brazalete Derecho': 'bracerRight',
      'Pantalón': 'pants',
      'Zapatos': 'shoes',
      'Arma Principal': 'weapon1',
      'Arma Secundaria': 'weapon2',
      'Item 1': 'item1',
      'Item 2': 'item2',
      'Habilidad Épica': 'epicSkill'
    };
    return slotKeys[slotName] || slotName;
  }


  getAvailableItems(selectedSlot: string): any[] {
    switch (selectedSlot) {
      case 'Casco':
        const helmetItems = this.user.inventario.armors?.filter((item) => item.armorType === 'HELMET');
        const newHelmetItems = [...helmetItems, this.user.equipados.armors?.find((item) => item.armorType === 'HELMET')].filter(item => item !== undefined);
        return newHelmetItems;
        break;
      case 'Pecho':
        const chestItems = this.user.inventario.armors?.filter((item) => item.armorType === 'CHEST');
        const newChestItems = [...chestItems, this.user.equipados.armors?.find((item) => item.armorType === 'CHEST')].filter(item => item !== undefined);
        return newChestItems;
      case 'Guantes':
        const glovesItems = this.user.inventario.armors?.filter((item) => item.armorType === 'GLOVERS');
        const newGlovesItems = [...glovesItems, this.user.equipados.armors?.find((item) => item.armorType === 'GLOVERS')].filter(item => item !== undefined);
        return newGlovesItems;
        break;
      case 'Brazalete Izquierdo':
        const bracerLeftItems = this.user.inventario.armors?.filter((item) => item.armorType === 'BRACERS');
        const newBracerLeftItems = [...bracerLeftItems, this.user.equipados.armors?.find((item) => item.armorType === 'BRACERS')].filter(item => item !== undefined);
        return newBracerLeftItems;
        break;
      case 'Brazalete Derecho':
        const bracerRightItems = this.user.inventario.armors?.filter((item) => item.armorType === 'BRACERS');
        const newBracerRightItems = [...bracerRightItems, this.user.equipados.armors?.find((item) => item.armorType === 'BRACERS')].filter(item => item !== undefined);
        return newBracerRightItems;
        break;
      case 'Pantalón':
        const pantsItems = this.user.inventario.armors?.filter((item) => item.armorType === 'PANTS');
        const newPantsItems = [...pantsItems, this.user.equipados.armors?.find((item) => item.armorType === 'PANTS')].filter(item => item !== undefined);
        return newPantsItems;
        break;
      case 'Zapatos':
        const bootsItems = this.user.inventario.armors?.filter((item) => item.armorType === 'BOOTS');
        const newBootsItems = [...bootsItems, this.user.equipados.armors?.find((item) => item.armorType === 'BOOTS')].filter(item => item !== undefined);
        return newBootsItems;
        break;
      case 'Arma Principal':
        const weaponItems = this.user.inventario.weapons;
        const newWeaponItems = [...weaponItems, ...this.user.equipados.weapons].filter(item => item !== undefined);
        console.log('Items de arma principal disponibles:', newWeaponItems);
        return newWeaponItems;
        break;
      case 'Arma Secundaria':
        const secondaryWeaponItems = this.user.inventario.weapons
        const newSecondaryWeaponItems = [...secondaryWeaponItems, ...this.user.equipados.weapons].filter(item => item !== undefined);
        return newSecondaryWeaponItems;        
        break;
      case 'Item 1':
        const item1 = this.user.inventario.items
        const newItem1 = [...item1, ...this.user.equipados.items].filter(item => item !== undefined);
        return newItem1;
      case 'Item 2':
        const item2 = this.user.inventario.items
        const newItem2 = [...item2, ...this.user.equipados.items].filter(item => item !== undefined);
        return newItem2;
        break;
      case 'Habilidad Épica':
        const epicItems = this.user.inventario.epicAbility;
        const newEpicItems = [...epicItems, ...this.user.equipados.epicAbility].filter(item => item !== undefined);
        console.log('Items épicos disponibles:', newEpicItems);
        return newEpicItems;
        break;
      default:
        return [];
    }
  }

isEquipped(item: any): 'slot' | 'other' | 'none' {
  const slotKey = this.getSlotKey(this.selectedSlot);
  const equippedInSlot = this.equippedItems[slotKey];

  if (equippedInSlot && equippedInSlot.name === item.name) {
    return 'slot';
  }

  // ¿Está en otro slot?
  for (let key in this.equippedItems) {
    if (key !== slotKey && this.equippedItems[key]?.name === item.name) {
      return 'other';
    }
  }

  return 'none';
}

  equipSelectedItem() {
    if (!this.selectedItem) return;
    this.equipProduct(this.selectedItem.name, this.selectedSlot);
    this.selectedItem = null;
    this.closeEquipmentModal();
  }

  unequipSelectedItem() {
    if (!this.selectedItem) return;
    this.unequipProduct(this.selectedItem.name, this.selectedSlot);
    this.selectedItem = null;
    this.closeEquipmentModal();
  }

  unequipSlot() {
    if (this.isReady) return; // No permitir cambios si ya está listo
    if (this.equippedItems[this.selectedSlot]) {
      this.unequipItem(this.equippedItems[this.selectedSlot]);
      this.equippedItems[this.selectedSlot] = null;
    }
  }

onReady() {
  if (this.isReady) return;

  this.isReady = true;

  // Enviar stats completos al servidor
  this.sendReadyStatus();
}

sendReadyStatus() {
  const readyData = {
    playerId: this.userId,
    team: this.team,
    equippedItems: null,
    heroStats: this.heroStats, // <- stats ya actualizados
    isReady: true
  };

  this.battleService.onReady(
    this.roomId,
    this.userId,
    this.heroStats,
    this.team
  );

  console.log('Jugador listo con stats:', readyData);
}


  // Método para validar si se puede cambiar de equipo
  canChangeTeam(): boolean {
    return !this.isReady;
  }

  // Inicialización del componente
  initializeComponent() {
    // Aquí puedes agregar lógica de inicialización adicional
    // como cargar items disponibles desde el servidor
    console.log('Lobby inicializado para la sala:', this.roomId);
  }


  equipProduct(itemName: string, slot: string): void {
    switch(slot) {
      case 'Casco':
        this.equipArmor(itemName);
        break;
      case 'Pecho':
        this.equipArmor(itemName);
        break;
      case 'Guantes':
        this.equipArmor(itemName);
        break;
      case 'Brazalete Izquierdo':
        this.equipArmor(itemName);
        break;
      case 'Brazalete Derecho':
        this.equipArmor(itemName);
        break;
      case 'Pantalón':
        this.equipArmor(itemName);
        break;
      case 'Zapatos':
        this.equipArmor(itemName);
        break;
      case 'Arma Principal':
        this.equipWeapon(itemName);
        break;
      case 'Arma Secundaria':
        this.equipWeapon(itemName);
        break;
      case 'Item 1':
        this.equipItem(itemName);
        break;
      case 'Item 2':
        this.equipItem(itemName);
        break;
      case 'Habilidad Épica':
        this.equipEpic(itemName);
        break;
      default:
        console.error('Slot desconocido:', slot);
        break;
    }
    const slotKey = this.getSlotKey(slot);
const item = this.getItemByName(itemName);
this.equippedItems[slotKey] = item;

    this.updateHeroStats(itemName, true, slot);
  }

  getItemByName(itemName: string): any | null {
  const allItems = [
    ...(this.user.inventario?.items || []),
    ...(this.user.inventario?.armors || []),
    ...(this.user.inventario?.weapons || []),
    ...(this.user.inventario?.epicAbility || []),
    ...(this.user.equipados?.items || []),
    ...(this.user.equipados?.armors || []),
    ...(this.user.equipados?.weapons || []),
    ...(this.user.equipados?.epicAbility || []),
  ];

  return allItems.find(item => item?.name === itemName) || null;
}



    unequipProduct(itemName: string, slot: string): void {
    switch(slot) {
      case 'Casco':
        this.unequipArmor(itemName);
        break;
      case 'Pecho':
        this.unequipArmor(itemName);
        break;
      case 'Guantes':
        this.unequipArmor(itemName);
        break;
      case 'Brazalete Izquierdo':
        this.unequipArmor(itemName);
        break;
      case 'Brazalete Derecho':
        this.unequipArmor(itemName);
        break;
      case 'Pantalón':
        this.unequipArmor(itemName);
        break;
      case 'Zapatos':
        this.unequipArmor(itemName);
        break;
      case 'Arma Principal':
        this.unequipWeapon(itemName);
        break;
      case 'Arma Secundaria':
        this.unequipWeapon(itemName);
        break;
      case 'Item 1':
        this.unequipItem(itemName);
        break;
      case 'Item 2':
        this.unequipItem(itemName);
        break;
      case 'Habilidad Épica':
        this.unequipEpic(itemName);
        break;
      default:
        console.error('Slot desconocido:', slot);
        break;
    }
    this.updateHeroStats(itemName, false, slot);
    const slotKey = this.getSlotKey(slot);
this.equippedItems[slotKey] = null;

  }

  equipItem(itemName: string): void {
    if (this.isReady) return; // No permitir cambios si ya está listo
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

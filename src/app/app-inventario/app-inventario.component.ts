import { Component } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import User from '../domain/user.model';
import { CommonModule } from '@angular/common';
import { Effect } from '../domain/effect.model';
import { BattleService } from '../services/battle.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import '../app-comentarios/web-components/app-root';

/**
 * AppInventarioComponent
 *
 * Componente que gestiona el inventario del jugador.
 *
 * Breve resumen:
 * - Carga y muestra los ítems del inventario y los ítems equipados.
 * - Permite equipar/unequipar ítems, armas, armaduras, héroes y habilidades épicas.
 * - Administra paginación de ítems, modales de selección y notificaciones de UI.
 * - Actualiza las estadísticas del héroe según los efectos de los ítems equipados.
 *
 * Responsabilidades principales:
 * - Obtener los datos del usuario y su inventario desde el backend.
 * - Mantener el estado de ítems equipados y actualizar estadísticas del héroe.
 * - Gestionar la UI del modal de equipamiento (paginación, selección, apertura/cierre).
 * - Notificar al backend al equipar/unequipar y manejar errores de red.
 *
 * @property {string} roomId - ID de la sala actual extraído de la URL.
 * @property {any[]} players - Lista de jugadores en la sala.
 * @property {any} heroStats - Estadísticas del héroe del jugador actual.
 * @property {number} itemsPerPage - Ítems mostrados por página.
 * @property {number} currentPage - Página actual en la paginación de ítems.
 * @property {string} userId - ID del jugador actual (obtenido del localStorage).
 * @property {string} team - Equipo del jugador ('A' por defecto).
 * @property {boolean} isReady - Indica si el jugador está listo para la batalla.
 * @property {boolean} showEquipmentModal - Controla la visibilidad del modal de equipamiento.
 * @property {string} selectedSlot - Slot seleccionado para equipar/unequipar.
 * @property {any|null} selectedItem - Ítem actualmente seleccionado en el modal.
 * @property {string|null} alertMessage - Mensaje actual de alerta (toast).
 * @property {'success'|'error'|'warning'} alertType - Tipo de alerta.
 * @property {Subscription[]} subs - Subscripciones activas para limpiar en ngOnDestroy.
 * @property {any} battle - Información de la batalla (si aplica).
 * @property {boolean} showLimitAlert - Control para mostrar alerta de límite.
 * @property {string} limitAlertMessage - Mensaje de alerta por límite.
 * @property {User} user - Modelo del usuario con inventario y equipados.
 * @property {boolean} firstCharge - Marca para inicializar sólo la primera carga.
 * @property {object} equippedItems - Mapa con los ítems actualmente equipados por slot.
 */

@Component({
  selector: 'app-inventario',
  templateUrl: './app-inventario.component.html',
  styleUrls: ['./app-inventario.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AppInventarioComponent {
  message = '';
  /** ID de la sala actual extraído de la URL */
  roomId!: string;

  /** Lista de jugadores en la sala */
  players: any[] = [];

  /** Estadísticas del héroe del jugador actual */
  heroStats: any;

  itemsPerPage = 8;
  currentPage = 1;

  /** ID del jugador actual (obtenido del localStorage) */
  userId: string = localStorage.getItem('username') || '';

  /** Equipo del jugador (puede ser 'A' o 'B') */
  team: string = 'A';

  // Nuevas propiedades para el equipamiento
  /** isReady - Propiedad pública. */
  isReady: boolean = false;
  /** showEquipmentModal - Propiedad pública. */
  showEquipmentModal: boolean = false;
  /** selectedSlot - Propiedad pública. */
  selectedSlot: string = '';
  /** selectedItem - Propiedad pública. */
  selectedItem: any = null;
  /** alertMessage - Propiedad pública. */

    alertMessage: string | null = null;
  /** alertType - Propiedad pública. */
  alertType: 'success' | 'error' | 'warning' = 'success';
  /** subs - Propiedad pública. */

  private subs: Subscription[] = [];
  /** battle - Propiedad pública. */
  battle: any;

  // Propiedad para mostrar el toast
  /** showLimitAlert - Propiedad pública. */
showLimitAlert: boolean = false;
  /** limitAlertMessage - Propiedad pública. */
limitAlertMessage: string = '';
  /** user - Propiedad pública. */

  user: User = new User();

  firstCharge = true;
  /** equippedItems - Propiedad pública. */

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
    epicSkill: null,
    hero: null,
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
   * Inicializa el componente cargando los datos del héroe y del inventario.
   * @returns {void}
   */
  /**
   * Inicializar el componente.
   * - Obtiene `roomId` desde la ruta.
   * - Carga estadísticas del héroe y el inventario del usuario.
   * - Se suscribe a observables necesarios.
   * @returns {void}
   */
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';

    const heroSub = this.battleService
      .getHeroStatsByPlayerId(this.userId)
      .subscribe((hero) => {
        this.heroStats = hero;
        console.log('Estadísticas del héroe cargadas:', this.heroStats);
        console.log('Nivel del héroe:', this.heroStats?.hero?.level);
        console.log('Tipo de héroe:', this.heroStats?.hero.heroType);
        console.log('maximo damage:', this.heroStats?.hero.damage.min);
        console.log('maximo damage:', this.heroStats?.hero.damage.max);
      });

    this.subs.push(heroSub);

    this.showInventory();
  }

    showAlert(
    message: string,
  /** type - Propiedad pública. */
    type: 'success' | 'error' | 'warning' = 'success'
  ) {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = null;
    }, 3500); // Oculta después de 3.5s
  }
  /**
   * Obtener y mostrar el inventario del usuario actual.
   * Solicita los datos al backend y actualiza `equippedItems`.
   * @returns {void}
   */


  showInventory(): void {
    this.userService.getUsuarioById(this.userId).subscribe({
  /** next - Propiedad pública. */
      next: (data) => {
        this.user = data;
        this.equippedItems = {
          helmet:
            this.user.equipados.armors?.find(
              (item) => item.armorType === 'HELMET'
            ) || null,
          chest:
            this.user.equipados.armors?.find(
              (item) => item.armorType === 'CHEST'
            ) || null,
          gloves:
            this.user.equipados.armors?.find(
              (item) => item.armorType === 'GLOVERS'
            ) || null,
          bracerLeft:
            this.user.equipados.armors?.find(
              (item) => item.armorType === 'BRACERS'
            ) || null,
          bracerRight:
            this.user.equipados.armors?.find(
              (item) => item.armorType === 'BRACERS'
            ) || null,
          pants:
            this.user.equipados.armors?.find(
              (item) => item.armorType === 'PANTS'
            ) || null,
          shoes:
            this.user.equipados.armors?.find(
              (item) => item.armorType === 'BOOTS'
            ) || null,
          weapon1: this.user.equipados.weapons?.[0] || null,
          weapon2: this.user.equipados.weapons?.[1] || null,
          item1: this.user.equipados.items?.[0] || null,
          item2: this.user.equipados.items?.[1] || null,
          epicSkill: this.user.equipados.epicAbility?.[0] || null,
          hero: this.user.equipados.hero?.[0] || null,
        };

        if (this.firstCharge) {
          for (let slot in this.equippedItems) {
            if (this.equippedItems[slot]) {
              const slotName = this.getSlotName(slot);
              this.updateHeroStats(this.equippedItems[slot], true, slotName);
            }
          }
          this.firstCharge = false;
        }
      },
  /** error - Propiedad pública. */
      error: (error) => {
        console.error('Error al cargar items:', error);
        alert('No se pudo obtener la lista de items.');
      },
    });
  }


  getPaginatedItems(slot: string) {
    const allItems = this.getAvailableItems(slot) || [];
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return allItems.slice(startIndex, startIndex + this.itemsPerPage);
  }
  /**
   * Calcular el número total de páginas para un slot.
   * @param {string} slot - Nombre del slot (en español).
   * @returns {number} Total de páginas.
   */

  getTotalPages(slot: string): number {
    const allItems = this.getAvailableItems(slot) || [];
    return Math.ceil(allItems.length / this.itemsPerPage);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.selectedItem = null; // Deselecciona ítem al cambiar página (opcional)
    }
  }

  nextPage(slot: string) {
    if (this.currentPage < this.getTotalPages(slot)) {
      this.currentPage++;
      this.selectedItem = null;
    }
  }
  /**
   * Obtener la URL de la imagen de un ítem por su nombre.
   * @param {string} itemName - Nombre del ítem.
   * @returns {string|undefined} URL de la imagen o undefined si no existe.
   */

  getImageByItemName(itemName: string): string | undefined {
    const sources = [
      ...(this.user.inventario.weapons || []),
      ...(this.user.inventario.armors || []),
      ...(this.user.inventario.items || []),
      ...(this.user.inventario.epicAbility || []),
      ...(this.user.equipados.weapons || []),
      ...(this.user.equipados.armors || []),
      ...(this.user.equipados.items || []),
      ...(this.user.equipados.epicAbility || []),
    ];

    const foundItem = sources.find((item) => item?.name === itemName);
    return foundItem?.image;
  }

  updateStats(effect: Effect, equip: boolean) {
    if (!this.heroStats?.hero) {
      console.log(
        'No se pueden actualizar las estadísticas del héroe: heroStats o hero no definido'
      );
      return;
    }
    const multiplier = equip ? 1 : -1;
    switch (effect.effectType) {
      case 'DAMAGE':
        this.heroStats.hero.damage.min += effect.value * multiplier;
        this.heroStats.hero.damage.max += effect.value * multiplier;
        break;
      case 'HEAL':
        this.heroStats.hero.health += effect.value * multiplier;
        break;
      case 'BOOST_ATTACK':
        this.heroStats.hero.attack += effect.value * multiplier;
        break;
      case 'BOOST_DEFENSE':
        this.heroStats.hero.defense += effect.value * multiplier;
        break;
      case 'DEFENSE':
        this.heroStats.hero.defense += effect.value * multiplier;
        break;
  /** default - Propiedad pública. */
      default:
        console.log('Tipo de efecto no manejado:', effect.effectType);
        break;
    }
  }

  // Actualizar estadísticas del héroe basado en equipamiento
  updateHeroStats(itemName: string, equip: boolean, slot: string) {
    if (!this.heroStats?.hero) {
      console.log(
        'No se pueden actualizar las estadísticas del héroe: heroStats o hero no definido'
      );
      return;
    }
    switch (slot) {
      case 'Casco':
        const helmet =
          this.user.inventario.armors?.find((item) => item.name === itemName) ||
          this.user.equipados.armors?.find((item) => item.name === itemName);
        if (helmet) {
          for (let effect of helmet.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Pecho':
        const chest =
          this.user.inventario.armors?.find((item) => item.name === itemName) ||
          this.user.equipados.armors?.find((item) => item.name === itemName);
        if (chest) {
          for (let effect of chest.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Guantes':
        const gloves =
          this.user.inventario.armors?.find((item) => item.name === itemName) ||
          this.user.equipados.armors?.find((item) => item.name === itemName);
        if (gloves) {
          for (let effect of gloves.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Brazalete Izquierdo':
        const bracerLeft =
          this.user.inventario.armors?.find((item) => item.name === itemName) ||
          this.user.equipados.armors?.find((item) => item.name === itemName);
        if (bracerLeft) {
          for (let effect of bracerLeft.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Brazalete Derecho':
        const bracerRight =
          this.user.inventario.armors?.find((item) => item.name === itemName) ||
          this.user.equipados.armors?.find((item) => item.name === itemName);
        if (bracerRight) {
          for (let effect of bracerRight.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Pantalón':
        const pants =
          this.user.inventario.armors?.find((item) => item.name === itemName) ||
          this.user.equipados.armors?.find((item) => item.name === itemName);
        if (pants) {
          for (let effect of pants.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Zapatos':
        const boots =
          this.user.inventario.armors?.find((item) => item.name === itemName) ||
          this.user.equipados.armors?.find((item) => item.name === itemName);
        if (boots) {
          for (let effect of boots.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Arma Principal':
        const weapon =
          this.user.inventario.weapons?.find(
            (item) => item.name === itemName
          ) ||
          this.user.equipados.weapons?.find((item) => item.name === itemName);
        if (weapon) {
          for (let effect of weapon.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Arma Secundaria':
        const secondaryWeapon =
          this.user.inventario.weapons?.find(
            (item) => item.name === itemName
          ) ||
          this.user.equipados.weapons?.find((item) => item.name === itemName);
        if (secondaryWeapon) {
          for (let effect of secondaryWeapon.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Item 1':
        const item1 =
          this.user.inventario.items?.find((item) => item.name === itemName) ||
          this.user.equipados.items?.find((item) => item.name === itemName);
        if (item1) {
          for (let effect of item1.effects) {
            this.updateStats(effect, equip);
          }
        }

        break;
      case 'Item 2':
        const item2 =
          this.user.inventario.items?.find((item) => item.name === itemName) ||
          this.user.equipados.items?.find((item) => item.name === itemName);
        if (item2) {
          for (let effect of item2.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
      case 'Habilidad Épica':
        const epic =
          this.user.inventario.epicAbility?.find(
            (item) => item.name === itemName
          ) ||
          this.user.equipados.epicAbility?.find(
            (item) => item.name === itemName
          );
        if (epic) {
          for (let effect of epic.effects) {
            this.updateStats(effect, equip);
          }
        }
        break;
  /** default - Propiedad pública. */
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
  /**
   * Destruir el componente.
   * Libera todas las subscripciones para evitar fugas de memoria.
   * @returns {void}
   */
  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  openEquipmentModal(slot: string) {
    if (this.isReady) return; // No permitir cambios si ya está listo
    this.selectedSlot = this.getSlotName(slot);
    this.selectedItem = null;
    this.currentPage = 1; // <-- Resetea la paginación al abrir el modal
    this.showEquipmentModal = true;
  }

  closeEquipmentModal() {
    this.showEquipmentModal = false;
    this.selectedSlot = '';
    this.selectedItem = null;
  }

  // Obtener nombre del slot en español
  /**
   * Convertir la clave del slot a su nombre en español.
   * @param {string} slot - Clave del slot.
   * @returns {string} Nombre en español del slot.
   */
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
      epicSkill: 'Habilidad Épica',
      hero: 'Heroe',
    };
    return slotNames[slot] || slot;
  }
  /**
   * Convertir nombre del slot en español a la clave interna.
   * @param {string} slotName - Nombre en español del slot.
   * @returns {string} Clave interna del slot.
   */

  getSlotKey(slotName: string): string {
    const slotKeys: any = {
      Casco: 'helmet',
      Pecho: 'chest',
      Guantes: 'gloves',
      'Brazalete Izquierdo': 'bracerLeft',
      'Brazalete Derecho': 'bracerRight',
      Pantalón: 'pants',
      Zapatos: 'shoes',
      'Arma Principal': 'weapon1',
      'Arma Secundaria': 'weapon2',
      'Item 1': 'item1',
      'Item 2': 'item2',
      'Habilidad Épica': 'epicSkill',
      Heroe: 'hero',
    };
    return slotKeys[slotName] || slotName;
  }
  /**
   * Obtener la lista de ítems disponibles para un slot específico.
   * Incluye ítems del inventario y el actualmente equipado (si aplica).
   * @param {string} selectedSlot - Nombre del slot en español.
   * @returns {any[]} Lista de ítems disponibles.
   */

  getAvailableItems(selectedSlot: string): any[] {
    switch (selectedSlot) {
      case 'Casco':
        const helmetItems = this.user.inventario.armors?.filter(
          (item) => item.armorType === 'HELMET'
        );
        const newHelmetItems = [
          ...helmetItems,
          this.user.equipados.armors?.find(
            (item) => item.armorType === 'HELMET'
          ),
        ].filter((item) => item !== undefined);
        return newHelmetItems;
        break;
      case 'Pecho':
        const chestItems = this.user.inventario.armors?.filter(
          (item) => item.armorType === 'CHEST'
        );
        const newChestItems = [
          ...chestItems,
          this.user.equipados.armors?.find(
            (item) => item.armorType === 'CHEST'
          ),
        ].filter((item) => item !== undefined);
        return newChestItems;
      case 'Guantes':
        const glovesItems = this.user.inventario.armors?.filter(
          (item) => item.armorType === 'GLOVERS'
        );
        const newGlovesItems = [
          ...glovesItems,
          this.user.equipados.armors?.find(
            (item) => item.armorType === 'GLOVERS'
          ),
        ].filter((item) => item !== undefined);
        return newGlovesItems;
        break;
      case 'Brazalete Izquierdo':
        const bracerLeftItems = this.user.inventario.armors?.filter(
          (item) => item.armorType === 'BRACERS'
        );
        const newBracerLeftItems = [
          ...bracerLeftItems,
          this.user.equipados.armors?.find(
            (item) => item.armorType === 'BRACERS'
          ),
        ].filter((item) => item !== undefined);
        return newBracerLeftItems;
        break;
      case 'Brazalete Derecho':
        const bracerRightItems = this.user.inventario.armors?.filter(
          (item) => item.armorType === 'BRACERS'
        );
        const newBracerRightItems = [
          ...bracerRightItems,
          this.user.equipados.armors?.find(
            (item) => item.armorType === 'BRACERS'
          ),
        ].filter((item) => item !== undefined);
        return newBracerRightItems;
        break;
      case 'Pantalón':
        const pantsItems = this.user.inventario.armors?.filter(
          (item) => item.armorType === 'PANTS'
        );
        const newPantsItems = [
          ...pantsItems,
          this.user.equipados.armors?.find(
            (item) => item.armorType === 'PANTS'
          ),
        ].filter((item) => item !== undefined);
        return newPantsItems;
        break;
      case 'Zapatos':
        const bootsItems = this.user.inventario.armors?.filter(
          (item) => item.armorType === 'BOOTS'
        );
        const newBootsItems = [
          ...bootsItems,
          this.user.equipados.armors?.find(
            (item) => item.armorType === 'BOOTS'
          ),
        ].filter((item) => item !== undefined);
        return newBootsItems;
        break;
      case 'Arma Principal':
        const weaponItems = this.user.inventario.weapons;
        const newWeaponItems = [
          ...weaponItems,
          ...this.user.equipados.weapons,
        ].filter((item) => item !== undefined);
        console.log('Items de arma principal disponibles:', newWeaponItems);
        return newWeaponItems;
        break;
      case 'Arma Secundaria':
        const secondaryWeaponItems = this.user.inventario.weapons;
        const newSecondaryWeaponItems = [
          ...secondaryWeaponItems,
          ...this.user.equipados.weapons,
        ].filter((item) => item !== undefined);
        return newSecondaryWeaponItems;
        break;
      case 'Item 1':
        const item1 = this.user.inventario.items;
        const newItem1 = [...item1, ...this.user.equipados.items].filter(
          (item) => item !== undefined
        );
        return newItem1;
      case 'Item 2':
        const item2 = this.user.inventario.items;
        const newItem2 = [...item2, ...this.user.equipados.items].filter(
          (item) => item !== undefined
        );
        return newItem2;
        break;
      case 'Habilidad Épica':
        const epicItems = this.user.inventario.epicAbility;
        const newEpicItems = [
          ...epicItems,
          ...this.user.equipados.epicAbility,
        ].filter((item) => item !== undefined);
        console.log('Items épicos disponibles:', newEpicItems);
        return newEpicItems;
        break;
      case 'Heroe':
        const heros = this.user.inventario.hero;
        const newHero = [...heros, ...this.user.equipados.hero].filter(
          (item) => item !== undefined
        );
        console.log('heroes disponibles:', newHero);
        return newHero;
        break;
  /** default - Propiedad pública. */
      default:
        return [];
    }
  }
  /**
   * Verificar si un ítem está equipado en el slot seleccionado, en otro slot o no está equipado.
   * @param {any} item - Ítem a verificar.
   * @returns {'slot'|'other'|'none'} Estado del ítem.
   */

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
    const equipped = this.equipProduct(this.selectedItem.name, this.selectedSlot);
    if (equipped) {
    this.selectedItem = null;
    this.closeEquipmentModal();
  }
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
  /**
   * Intentar equipar un producto (armadura, arma, item, épica o héroe) en el slot indicado.
   * Realiza validaciones de límite y conflictos por slot.
   * @param {string} itemName - Nombre del ítem a equipar.
   * @param {string} slot - Nombre del slot en español.
   * @returns {boolean} true si se equipó correctamente; false si hubo restricción.
   */

equipProduct(itemName: string, slot: string): boolean {
  const slotKey = this.getSlotKey(slot);
  const item = this.getItemByName(itemName);

  let currentSlotKey: string | null = null;

  // ✅ Swap solo aplica a no-brazaletes
  if (currentSlotKey && currentSlotKey !== slotKey) {
    const temp = this.equippedItems[slotKey];
    if (temp) {
      this.updateHeroStats(temp.name, false, slot);
    }

    this.equippedItems[slotKey] = item;
    this.equippedItems[currentSlotKey] = temp || null;

    this.updateHeroStats(itemName, true, slot);
    return true;
  }

  switch (slot) {
    case 'Casco':
      if (this.equippedItems.helmet) {
        this.showAlert('Ya tienes un casco equipado.', 'warning');
        return false;
      }
      this.equipArmor(itemName);
      break;

    case 'Pecho':
      if (this.equippedItems.chest) {
        this.showAlert('Ya tienes una pechera equipada.', 'warning');
        return false;
      }
      this.equipArmor(itemName);
      break;

    case 'Guantes':
      if (this.equippedItems.gloves) {
        this.showAlert('Ya tienes guantes equipados.', 'warning');
        return false;
      }
      this.equipArmor(itemName);
      break;

    case 'Brazalete Izquierdo':
      if (this.equippedItems.bracerLeft) {
        this.showAlert('Ya tienes un brazalete izquierdo equipado.', 'warning');
        return false;
      }
      this.equipArmor(itemName);
      break;

    case 'Brazalete Derecho':
      if (this.equippedItems.bracerRight) {
        this.showAlert('Ya tienes un brazalete derecho equipado.', 'warning');
        return false;
      }
      this.equipArmor(itemName);
      break;

    case 'Pantalón':
      if (this.equippedItems.pants) {
        this.showAlert('Ya tienes un pantalón equipado.', 'warning');
        return false;
      }
      this.equipArmor(itemName);
      break;

    case 'Zapatos':
      if (this.equippedItems.shoes) {
        this.showAlert('Ya tienes zapatos equipados.', 'warning');
        return false;
      }
      this.equipArmor(itemName);
      break;

    case 'Arma Principal':
    case 'Arma Secundaria':
      if (this.equippedItems.weapon1 && this.equippedItems.weapon2) {
        this.showAlert('Ya tienes el máximo de 2 armas equipadas.', 'warning');
        return false;
      }
      this.equipWeapon(itemName);
      break;

    case 'Item 1':
    case 'Item 2':
      if (this.equippedItems.item1 && this.equippedItems.item2) {
        this.showAlert('Ya tienes el máximo de 2 ítems equipados.', 'warning');
        return false;
      }
      this.equipItem(itemName);
      break;

    case 'Habilidad Épica':
      if (this.equippedItems.epicSkill) {
        this.showAlert('Ya tienes una habilidad épica equipada.', 'warning');
        return false;
      }
      this.equipEpic(itemName);
      break;

    case 'Heroe':
      if (this.equippedItems.hero) {
        this.showAlert('Ya tienes un héroe equipado.', 'warning');
        return false;
      }
      this.equipHero(itemName);
      break;
  /** default - Propiedad pública. */

    default:
      console.error('Slot desconocido:', slot);
      return false;
  }

  // ✅ Actualizar stats y asignar al slot
  if (this.equippedItems[slotKey]) {
    this.updateHeroStats(this.equippedItems[slotKey].name, false, slot);
  }

  this.equippedItems[slotKey] = item;
  this.updateHeroStats(itemName, true, slot);

  return true;
}
  /**
   * Buscar un ítem por su nombre en inventario y equipados.
   * @param {string} itemName - Nombre del ítem.
   * @returns {any|null} El objeto del ítem o null si no se encuentra.
   */

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
      ...(this.user.equipados?.hero || []),
    ];

    return allItems.find((item) => item?.name === itemName) || null;
  }
  /**
   * Desequipar un producto según el slot indicado y actualizar estadísticas.
   * @param {string} itemName - Nombre del ítem a desequipar.
   * @param {string} slot - Nombre del slot en español.
   * @returns {void}
   */

  unequipProduct(itemName: string, slot: string): void {
    switch (slot) {
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
      case 'Heroe':
        this.unequipHero(itemName);
        break;
  /** default - Propiedad pública. */
      default:
        console.error('Slot desconocido:', slot);
        break;
    }
    this.updateHeroStats(itemName, false, slot);
    const slotKey = this.getSlotKey(slot);
    this.equippedItems[slotKey] = null;
  }
  /**
   * Equipar un ítem de tipo consumible/utilitario via backend.
   * @param {string} itemName - Nombre del ítem.
   * @returns {void}
   */

  equipItem(itemName: string): void {
    if (this.isReady) return; // No permitir cambios si ya está listo
    this.userService.equipItem(this.userId, itemName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Ítem ${itemName} equipado con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar item:', err);
        this.message = `No se pudo equipar el ítem ${itemName}.`;
      },
    });
  }
  /**
   * Equipar un héroe desde el inventario via backend.
   * @param {string} heroName - Nombre del héroe.
   * @returns {void}
   */

  equipHero(heroName: string): void {
    this.userService.equipHero(this.userId, heroName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `heroe ${heroName} equipado con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar heroe:', err);
        this.message = `No se pudo equipar el heroe ${heroName}.`;
      },
    });
  }
  /**
   * Equipar un arma via backend.
   * @param {string} weaponName - Nombre del arma.
   * @returns {void}
   */

  equipWeapon(weaponName: string): void {
    this.userService.equipWeapon(this.userId, weaponName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Arma ${weaponName} equipada con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar arma:', err);
        this.message = `No se pudo equipar el arma ${weaponName}.`;
      },
    });
  }

  /** Equipar una armadura */
  /**
   * Equipar una armadura via backend.
   * @param {string} armorName - Nombre de la armadura.
   * @returns {void}
   */
  equipArmor(armorName: string): void {
    this.userService.equipArmor(this.userId, armorName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Armadura ${armorName} equipada con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar armadura:', err);
        this.message = `No se pudo equipar la armadura ${armorName}.`;
      },
    });
  }

  /** Equipar una épica */
  /**
   * Equipar una habilidad épica via backend.
   * @param {string} epicName - Nombre de la épica.
   * @returns {void}
   */
  equipEpic(epicName: string): void {
    this.userService.equipEpic(this.userId, epicName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Épica ${epicName} equipada con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar épica:', err);
        this.message = `No se pudo equipar la épica ${epicName}.`;
      },
    });
  }
  /**
   * Desequipar un ítem via backend.
   * @param {string} itemName - Nombre del ítem.
   * @returns {void}
   */

  unequipItem(itemName: string): void {
    this.userService.unequipItem(this.userId, itemName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Ítem ${itemName} quitado con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar item:', err);
        this.message = `No se pudo equipar el ítem ${itemName}.`;
      },
    });
  }
  /**
   * Desequipar un héroe via backend.
   * @param {string} heroName - Nombre del héroe.
   * @returns {void}
   */

  unequipHero(heroName: string): void {
    this.userService.unequipHero(this.userId, heroName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `heroe ${heroName} quitado con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar heroe:', err);
        this.message = `No se pudo equipar el heroe ${heroName}.`;
      },
    });
  }
  /**
   * Desequipar un arma via backend.
   * @param {string} weaponName - Nombre del arma.
   * @returns {void}
   */

  unequipWeapon(weaponName: string): void {
    this.userService.unequipWeapon(this.userId, weaponName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Arma ${weaponName} quitado con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar arma:', err);
        this.message = `No se pudo equipar el arma ${weaponName}.`;
      },
    });
  }

  /** Equipar una armadura */
  /**
   * Desequipar una armadura via backend.
   * @param {string} armorName - Nombre de la armadura.
   * @returns {void}
   */
  unequipArmor(armorName: string): void {
    this.userService.unequipArmor(this.userId, armorName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Armadura ${armorName} quitado con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar armadura:', err);
        this.message = `No se pudo equipar la armadura ${armorName}.`;
      },
    });
  }
  /**
   * Desequipar una épica via backend.
   * @param {string} epicName - Nombre de la épica.
   * @returns {void}
   */

  unequipEpic(epicName: string): void {
    this.userService.unequipEpic(this.userId, epicName).subscribe({
  /** next - Propiedad pública. */
      next: () => {
        this.message = `Épica ${epicName} quitado con éxito.`;
        this.showInventory();
      },
  /** error - Propiedad pública. */
      error: (err) => {
        console.error('Error al equipar épica:', err);
        this.message = `No se pudo equipar la épica ${epicName}.`;
      },
    });
  }

    // (Eliminados métodos de integración con comentarios)
  /** Garantiza que exista el custom element de comentarios una sola vez */
  /**
   * Garantizar que el custom element de comentarios exista una sola vez en el DOM.
   * @returns {Promise<void>}
   */
  private async ensureCommentsRoot(): Promise<void> {
    if (document.querySelector('comments-root')) return;
    try {
      if ((window as any).customElements && !customElements.get('comments-root')) {
        await customElements.whenDefined('comments-root');
      }
    } catch {}
    const host = document.createElement('comments-root');
    host.setAttribute('minimal','');
    document.body.appendChild(host);
  }

  /** Abre comentarios para un item/armor/weapon mostrado en el modal */
  /**
   * Abrir la vista de comentarios para un ítem (armor/weapon/item).
   * Determina el tipo y el id a partir del objeto y despacha evento global.
   * @param {any} item - Objeto del ítem.
   * @returns {Promise<void>}
   */
  async openComentariosItem(item: any): Promise<void> {
    if (!item) return;
    // Determinar tipo (más estricto): sólo considerar armor si armorType está en la lista conocida
    let tipo: 'item' | 'armor' | 'weapon' = 'item';
    const knownArmorTypes = ['HELMET','CHEST','GLOVERS','BRACERS','PANTS','BOOTS'];
    if (item.weaponType) {
      tipo = 'weapon';
    } else if (item.armorType && knownArmorTypes.includes(item.armorType)) {
      tipo = 'armor';
    } else {
      tipo = 'item'; // utilitarios como piedra de afilar quedan como item
    }
    // Resolver id preferente por tipo
    let id: any;
    if (tipo === 'armor') {
      id = item.armorId ?? item.id ?? item._id ?? item.itemId ?? item.weaponId;
    } else if (tipo === 'weapon') {
      id = item.weaponId ?? item.id ?? item._id ?? item.itemId ?? item.armorId;
    } else {
      id = item.itemId ?? item.id ?? item._id ?? item.weaponId ?? item.armorId;
    }
    if (id === undefined || id === null || id === '') {
      console.warn('[Inventario] ID inválido para comentarios', item);
      return;
    }
    await this.ensureCommentsRoot();
    if ((window as any).customElements && !customElements.get('comments-root')) {
      try { await customElements.whenDefined('comments-root'); } catch {}
    }
    console.debug('[Inventario] abrir comentarios', { tipo, id, nombre: item.name });
    window.dispatchEvent(new CustomEvent('open-comments', { detail: { tipo, id, name: item.name } }));
  }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppChatComponent } from "../app-chat/app-chat.component";

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
  /** ID de la sala actual extraído de la URL */
  roomId!: string;

  /** Lista de jugadores en la sala */
  players: any[] = [];

  /** Estadísticas del héroe del jugador actual */
  heroStats: any;

  /** ID del jugador actual (obtenido del localStorage) */
  id: string = localStorage.getItem('username') || '';

  /** Equipo del jugador (puede ser 'A' o 'B') */
  team: string = 'A';

  // Nuevas propiedades para el equipamiento
  isReady: boolean = false;
  showEquipmentModal: boolean = false;
  selectedSlot: string = '';

  /** Suscripciones a observables para limpiar en ngOnDestroy */
  private subs: Subscription[] = [];
battle: any;

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
    private battleService: BattleService
  ) {}

  /**
   * Hook de inicialización del componente.
   * - Obtiene `roomId` desde la ruta.
   * - Recupera las estadísticas del héroe.
   * - Se suscribe al evento `battleStarted` para redirigir al campo de batalla.
   */
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.heroStats = this.battleService.getHeroStatsByPlayerId(this.id);

    const battleSub = this.battleService.listen<any>('battleStarted').subscribe(event => {
      this.battleService.setCurrentBattle(event);
      this.battleService.joinBattle(this.roomId, this.id);
      this.router.navigate([`/battle/${this.roomId}`]);
    });

    this.subs.push(battleSub);
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


  // Objeto para almacenar items equipados
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

  // Datos de ejemplo para los items disponibles (reemplaza con tu lógica real)
  availableItems: any = {
    helmet: [
      { id: 1, name: 'Casco de Hierro', image: 'assets/items/helmet1.png', stats: '+10 DEF' },
      { id: 2, name: 'Casco Dorado', image: 'assets/items/helmet2.png', stats: '+15 DEF' },
    ],
    chest: [
      { id: 1, name: 'Bata de Cirujano', image: 'https://i.ibb.co/XfZyd4Pr/Bata-de-cirujano.png', stats: '+20 DEF' },
      { id: 2, name: 'Atadura Carmesí', image: 'https://i.ibb.co/Rn2207B/Atadura-carmes.png', stats: '+30 DEF' },
    ],
    gloves: [
      { id: 1, name: 'Guantes de Cuero', image: 'assets/items/gloves1.png', stats: '+5 ATK' },
      { id: 2, name: 'Guantes de Malla', image: 'assets/items/gloves2.png', stats: '+8 ATK' },
    ],
    bracerLeft: [
      { id: 1, name: 'Brazal Simple', image: 'assets/items/bracer1.png', stats: '+3 DEF' },
      { id: 2, name: 'Brazal Reforzado', image: 'assets/items/bracer2.png', stats: '+6 DEF' },
    ],
    bracerRight: [
      { id: 1, name: 'Brazal Simple', image: 'assets/items/bracer1.png', stats: '+3 DEF' },
      { id: 2, name: 'Brazal Reforzado', image: 'assets/items/bracer2.png', stats: '+6 DEF' },
    ],
    pants: [
      { id: 1, name: 'Pantalones de Cuero', image: 'assets/items/pants1.png', stats: '+12 DEF' },
      { id: 2, name: 'Pantalones de Malla', image: 'assets/items/pants2.png', stats: '+18 DEF' },
    ],
    shoes: [
      { id: 1, name: 'Botas de Cuero', image: 'assets/items/shoes1.png', stats: '+7 DEF' },
      { id: 2, name: 'Botas de Guerra', image: 'assets/items/shoes2.png', stats: '+12 DEF' },
    ],
    weapon1: [
      { id: 1, name: 'Báculo de Permafrost', image: 'https://i.ibb.co/zH8mC2ZF/B-culo-de-permafrost.png', stats: '+15 ATK' },
      { id: 2, name: 'Cierra Sangrienta', image: 'https://i.ibb.co/7dQ1RRhq/Cierra-sangrienta.png', stats: '+25 ATK' },
    ],
    weapon2: [
      { id: 1, name: 'Daga', image: 'assets/items/dagger1.png', stats: '+10 ATK' },
      { id: 2, name: 'Hacha', image: 'assets/items/axe1.png', stats: '+20 ATK' },
    ],
    item1: [
      { id: 1, name: 'Anillo Piro Explosión', image: 'https://i.ibb.co/XrSLqDnL/anillo-para-piro-explosion.png', stats: '+50 HP' },
      { id: 2, name: 'Curitas', image: 'https://i.ibb.co/4nfWw5XZ/curitas.png', stats: '+10 ATK' },
    ],
    item2: [
      { id: 1, name: 'Amuleto', image: 'assets/items/amulet1.png', stats: '+5 DEF' },
      { id: 2, name: 'Gema Mágica', image: 'assets/items/gem1.png', stats: '+8 MAG' },
    ],
    epicSkill: [
      { id: 1, name: 'Frío concentrado', image: 'https://i.ibb.co/x8dRsjk1/Frio-Concentrado.png', stats: 'Daño épico' },
      { id: 2, name: 'Golpe de Defensa', image: 'https://i.ibb.co/DHf6dcpb/Golpe-de-defensa.png', stats: 'Congelamiento' },
    ]
  };

  // Métodos para el modal de equipamiento
  openEquipmentModal(slot: string) {
    if (this.isReady) return; // No permitir cambios si ya está listo
    
    this.selectedSlot = slot;
    this.showEquipmentModal = true;
  }

  closeEquipmentModal() {
    this.showEquipmentModal = false;
    this.selectedSlot = '';
  }

  // Obtener items disponibles para un slot específico
  getAvailableItems(slot: string) {
    return this.availableItems[slot] || [];
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

  // Verificar si un item está equipado
  isEquipped(item: any): boolean {
    return Object.values(this.equippedItems).some((equippedItem: any) =>
      equippedItem && equippedItem.id === item.id
    );
  }

  // Equipar un item
  equipItem(item: any) {
    if (this.isReady) return;

    // Desequipar item anterior si existe
    if (this.equippedItems[this.selectedSlot]) {
      this.unequipSlot();
    }

    // Equipar nuevo item
    this.equippedItems[this.selectedSlot] = { ...item };
    this.closeEquipmentModal();
    
    // Aquí puedes agregar lógica para actualizar stats del héroe
    this.updateHeroStats();
  }

  // Desequipar item de un slot
  unequipSlot() {
    if (this.isReady) return;
    
    this.equippedItems[this.selectedSlot] = null;
    this.closeEquipmentModal();
    
    // Actualizar stats del héroe
    this.updateHeroStats();
  }

  // Actualizar estadísticas del héroe basado en equipamiento
  updateHeroStats() {
    // Aquí implementarías la lógica para recalcular las estadísticas
    // del héroe basado en los items equipados
    
    // Ejemplo básico:
    let bonusAttack = 0;
    let bonusDefense = 0;
    let bonusHealth = 0;

    Object.values(this.equippedItems).forEach((item: any) => {
      if (item && item.stats) {
        // Parsear stats básicos (esto es un ejemplo simple)
        if (item.stats.includes('ATK')) {
          const match = item.stats.match(/\+(\d+) ATK/);
          if (match) bonusAttack += parseInt(match[1]);
        }
        if (item.stats.includes('DEF')) {
          const match = item.stats.match(/\+(\d+) DEF/);
          if (match) bonusDefense += parseInt(match[1]);
        }
        if (item.stats.includes('HP')) {
          const match = item.stats.match(/\+(\d+) HP/);
          if (match) bonusHealth += parseInt(match[1]);
        }
      }
    });

    // Actualizar stats del héroe (ejemplo)
    // this.heroStats.hero.attack = this.baseAttack + bonusAttack;
    // this.heroStats.hero.defense = this.baseDefense + bonusDefense;
    // this.heroStats.hero.health = this.baseHealth + bonusHealth;
  }

  // Método para marcar como listo
  onReady() {
    if (this.isReady) return;
    
    this.isReady = true;
    
    // Aquí enviarías la información al servidor
    this.sendReadyStatus();
  }

  // Enviar estado de listo al servidor
  sendReadyStatus() {
    const readyData = {
      playerId: this.id,
      team: this.team,
      equippedItems: this.equippedItems,
      heroStats: this.heroStats,
      isReady: true
    };
    this.battleService.onReady(this.roomId, this.id, this.heroStats, this.team);
  }

  // Método para validar si se puede cambiar de equipo
  canChangeTeam(): boolean {
    return !this.isReady;
  }

  // Obtener todos los items equipados para enviar al servidor
  getEquippedItemsData() {
    const equippedData: any = {};
    
    Object.keys(this.equippedItems).forEach(slot => {
      if (this.equippedItems[slot]) {
        equippedData[slot] = {
          id: this.equippedItems[slot].id,
          name: this.equippedItems[slot].name,
          stats: this.equippedItems[slot].stats
        };
      }
    });
    
    return equippedData;
  }

  // Cargar configuración guardada (si tienes persistencia)
  loadSavedConfiguration() {
    // Ejemplo de carga desde localStorage o servidor
    const savedConfig = localStorage.getItem(`player-${this.id}-equipment`);
    if (savedConfig) {
      try {
        this.equippedItems = JSON.parse(savedConfig);
        this.updateHeroStats();
      } catch (e) {
        console.error('Error cargando configuración guardada:', e);
      }
    }
  }

  // Guardar configuración actual
  saveConfiguration() {
    const configToSave = JSON.stringify(this.equippedItems);
    localStorage.setItem(`player-${this.id}-equipment`, configToSave);
  }

  // Inicialización del componente
  initializeComponent() {
    // Aquí puedes agregar lógica de inicialización adicional
    // como cargar items disponibles desde el servidor
    console.log('Lobby inicializado para la sala:', this.roomId);
  }

}

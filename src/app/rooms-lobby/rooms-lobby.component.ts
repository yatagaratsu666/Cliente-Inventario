import { Component, OnDestroy, OnInit } from '@angular/core'; 
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppChatComponent } from "../app-chat/app-chat.component";
import { Effect } from '../domain/battle/HeroStats.model';

@Component({
  selector: 'app-room-lobby',
  templateUrl: './rooms-lobby.component.html',
  standalone: true,
  styleUrls: ['./rooms-lobby.component.css'],
  imports: [CommonModule, FormsModule, AppChatComponent]
})
export class RoomLobbyComponent implements OnInit, OnDestroy {
  roomId!: string;
  players: any[] = [];
  heroStats: any;
  id: string = localStorage.getItem('username') || '';
  team: string = 'A';

  isReady: boolean = false;
  showEquipmentModal: boolean = false;
  selectedSlot: string = '';

  private subs: Subscription[] = [];
  battle: any;

  // Equipamiento actual por slot
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleService: BattleService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';

    const heroSub = this.battleService.getHeroStatsByPlayerId(this.id).subscribe({
      next: (heroStats) => {
        this.heroStats = heroStats;

        // Aquí debes mapear los equipados del backend a los slots
        // Este es un ejemplo basado en tipos / índices (ajusta según tu lógica real)

        // Armors
        this.equippedItems.helmet = heroStats.equipped.armors.find((a: any) => a.armorType === 'helmet') || null;
        this.equippedItems.chest = heroStats.equipped.armors.find((a: any) => a.armorType === 'chest') || null;
        this.equippedItems.gloves = heroStats.equipped.armors.find((a: any) => a.armorType === 'gloves') || null;
        this.equippedItems.bracerLeft = heroStats.equipped.armors.find((a: any) => a.armorType === 'bracerLeft') || null;
        this.equippedItems.bracerRight = heroStats.equipped.armors.find((a: any) => a.armorType === 'bracerRight') || null;
        this.equippedItems.pants = heroStats.equipped.armors.find((a: any) => a.armorType === 'pants') || null;
        this.equippedItems.shoes = heroStats.equipped.armors.find((a: any) => a.armorType === 'shoes') || null;

        // Weapons (supongamos que hay máximo dos slots)
        this.equippedItems.weapon1 = heroStats.equipped.weapons[0] || null;
        this.equippedItems.weapon2 = heroStats.equipped.weapons[1] || null;

        // Items genéricos
        this.equippedItems.item1 = heroStats.equipped.items[0] || null;
        this.equippedItems.item2 = heroStats.equipped.items[1] || null;

        // Epic skill
        this.equippedItems.epicSkill = heroStats.equipped.epicAbilities[0] || null;

        this.updateHeroStats();

        console.log('Equipamiento cargado:', this.equippedItems);
      },
      error: (err) => console.error('Error cargando heroStats', err)
    });
    this.subs.push(heroSub);

    // Listener para iniciar batalla
    const battleSub = this.battleService.listen<any>('battleStarted').subscribe(event => {
      this.battleService.setCurrentBattle(event);
      this.battleService.joinBattle(this.roomId, this.id);
      this.router.navigate([`/battle/${this.roomId}`]);
    });
    this.subs.push(battleSub);
  }

  getFormattedEffects(item: any): string {
  if (!item?.effects || !Array.isArray(item.effects)) return '';

  return item.effects
    .slice(0, 2)
    .map((e: any) => `${this.formatEffectType(e.effectType)} +${e.value}`)
    .join(', ');
}

// Opcional: puedes traducir los effectType a nombres más amigables
formatEffectType(effectType: string): string {
  const translations: { [key: string]: string } = {
    BOOST_ATTACK: 'Ataque',
    BOOST_DEFENSE: 'Defensa',
    BOOST_HEALTH: 'Salud',
    // Agrega más si los tienes
  };
  return translations[effectType] || effectType;
}


  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  openEquipmentModal(slot: string) {
    if (this.isReady) return;
    this.selectedSlot = slot;
    this.showEquipmentModal = true;
  }

  closeEquipmentModal() {
    this.showEquipmentModal = false;
    this.selectedSlot = '';
  }

  // Obtener lista de items compatibles para el slot
  getAvailableItems(slot: string) {
    if (!this.heroStats) return [];

    switch(slot) {
      case 'helmet':
      case 'chest':
      case 'gloves':
      case 'bracerLeft':
      case 'bracerRight':
      case 'pants':
      case 'shoes':
        // Armaduras compatibles con el tipo de slot
        return this.heroStats.equipped.armors.filter((a: any) => a.armorType === slot);

      case 'weapon1':
      case 'weapon2':
        return this.heroStats.equipped.weapons;

      case 'item1':
      case 'item2':
        return this.heroStats.equipped.items;

      case 'epicSkill':
        return this.heroStats.equipped.epicAbilities;

      default:
        return [];
    }
  }

  equipItem(item: any) {
    if (this.isReady) return;

    this.equippedItems[this.selectedSlot] = item;
    this.closeEquipmentModal();
    this.updateHeroStats();
  }

  unequipSlot() {
    if (this.isReady) return;

    this.equippedItems[this.selectedSlot] = null;
    this.closeEquipmentModal();
    this.updateHeroStats();
  }

updateHeroStats() {
  if (!this.heroStats?.hero) return;

  // Base stats
  const baseAttack = this.heroStats.hero.attack || 0;
  const baseDefense = this.heroStats.hero.defense || 0;
  const baseHealth = this.heroStats.hero.health || 0;

  let bonusAttack = 0;
  let bonusDefense = 0;
  let bonusHealth = 0;

  Object.values(this.equippedItems).forEach((item: any) => {
    if (!item?.effects) return;

    item.effects.forEach((effect: Effect) => {
      switch (effect.effectType) {
        case 'BOOST_ATTACK':
        case 'ATK_BOOST':
          bonusAttack += effect.value;
          break;
        case 'BOOST_DEFENSE':
        case 'DEF_BOOST':
          bonusDefense += effect.value;
          break;
        case 'BOOST_HEALTH':
        case 'HP_BOOST':
          bonusHealth += effect.value;
          break;
        default:
          break;
      }
    });
  });

  this.heroStats.hero.attack = baseAttack + bonusAttack;
  this.heroStats.hero.defense = baseDefense + bonusDefense;
  this.heroStats.hero.health = baseHealth + bonusHealth;
}


  onReady() {
    if (this.isReady) return;

    this.updateHeroStats();

    this.isReady = true;

    this.sendReadyStatus();
  }

  sendReadyStatus() {
    const readyData = {
      playerId: this.id,
      team: this.team,
      equippedItems: this.equippedItems,
      heroStats: this.heroStats,
      isReady: true
    };

    this.battleService.onReady(
      this.roomId,
      this.id,
      this.heroStats,
      this.team
    );

    console.log('Jugador listo con datos:', readyData);
  }

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
}

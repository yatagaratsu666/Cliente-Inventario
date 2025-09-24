import { Component } from '@angular/core';
import { NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login.service';
import { Router } from '@angular/router';
import { ChatService } from './services/chat.service';
import { FormsModule } from '@angular/forms';
import { Item } from './domain/item.model';
import Hero from './domain/heroe.model';
import { Armor } from './domain/armor.model';
import { Epic } from './domain/epic.model';
import { Weapon } from './domain/weapon.model';
import { ItemsService } from './services/items.service';
import { HeroesService } from './services/heroes.service';
import { ArmorsService } from './services/armors.service';
import { EpicsService } from './services/epics.service';
import { WeaponsService } from './services/weapons.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend-inv';
  searchQuery: string = '';

  mostrarCuenta = false;
  jugadorNombre = 'Jugador1';
  cantidadTokens = 150;

  // datos filtrados (lo que se muestra)
  items: Item[] = [];
  heroes: Hero[] = [];
  armors: Armor[] = [];
  epics: Epic[] = [];
  weapons: Weapon[] = [];

  // copia completa (para filtrar en memoria)
  allItems: Item[] = [];
  allHeroes: Hero[] = [];
  allArmors: Armor[] = [];
  allEpics: Epic[] = [];
  allWeapons: Weapon[] = [];

  isBattleRoute = false;

  constructor(
    public loginService: LoginService,
    public router: Router,
    private chatService: ChatService,
    private itemService: ItemsService,
    private heroService: HeroesService,
    private armorService: ArmorsService,
    private epicsService: EpicsService,
    private weaponService: WeaponsService,
  ) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isBattleRoute = event.urlAfterRedirects.startsWith('battle');
      }
    });
  }

  ngOnInit() {
    // Traer todos los datos una sola vez
    this.itemService.showAllItems().subscribe({
      next: (data) => {
        this.allItems = data;
        this.items = data;
      },
      error: (err) => console.error('Error cargando items:', err)
    });

    this.heroService.showAllIHeros().subscribe({
      next: (data) => {
        this.allHeroes = data;
        this.heroes = data;
      },
      error: (err) => console.error('Error cargando heroes:', err)
    });

    this.armorService.showAllIArmors().subscribe({
      next: (data: Armor[]) => {
        this.allArmors = data;
        this.armors = data;
      },
      error: (err: any) => console.error('Error cargando armaduras:', err)
    });

    this.epicsService.showAllIEpics().subscribe({
      next: (data: Epic[]) => {
        this.allEpics = data;
        this.epics = data;
      },
      error: (err: any) => console.error('Error cargando épicos:', err)
    });

    this.weaponService.showAllIWeapon().subscribe({
      next: (data: Weapon[]) => {
        this.allWeapons = data;
        this.weapons = data;
      },
      error: (err: any) => console.error('Error cargando armas:', err)
    });
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

    /**
   * Navega a la vista de batallas al presionar el botón "Play".
   */
  onPlay() {
    this.router.navigate(['/battles']);
  }
  /**
   * Navega a la vista del inventario al presionar el botón "Mi Inventario".
   */
  onInventory() {
    this.router.navigate(['/inventory']); 
  }

  onAuction(){
    this.router.navigate(['/auctions']);
  }

  onTournament(){
    this.router.navigate(['/torneo']);
  }

  onMission(){
    this.router.navigate(['/misiones']);
  }

  onAccount(){
    this.router.navigate(['/cuenta']);
  }

  toggleCuenta() {
    this.mostrarCuenta = !this.mostrarCuenta;
  }

  onSearchChange(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      // restaurar todo si no hay texto
      this.items = this.allItems;
      this.heroes = this.allHeroes;
      this.armors = this.allArmors;
      this.epics = this.allEpics;
      this.weapons = this.allWeapons;
      return;
    }

    this.items = this.allItems.filter(i =>
      i.name?.toLowerCase().includes(query)
    );

    this.heroes = this.allHeroes.filter(h =>
      h.name?.toLowerCase().includes(query)
    );

    this.armors = this.allArmors.filter(a =>
      a.name?.toLowerCase().includes(query)
    );

    this.epics = this.allEpics.filter(e =>
      e.name?.toLowerCase().includes(query)
    );

    this.weapons = this.allWeapons.filter(w =>
      w.name?.toLowerCase().includes(query)
    );
  }
  goToComprar() {
  this.router.navigate(['/auctions']);
}

goToVender() {
  this.router.navigate(['/auctions/vender']);
}

goToRecoger() {
  this.router.navigate(['/auctions/recoger']);
}

goToMisPujas() {
  this.router.navigate(['/auctions/mis-pujas']);
}

  mostrarNotificaciones = true; // visible por defecto
  notificaciones: string[] = []; // lista de notificaciones

  cerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  abrirNotificaciones() {
    this.mostrarNotificaciones = true;
  }

  // método para agregar nuevas notificaciones en el futuro
  agregarNotificacion(msg: string) {
    this.notificaciones.push(msg);
  }
}







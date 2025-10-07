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
import { ToastComponent } from "./toast/toast.component";
import User from './domain/user.model';
import { AppLoginComponent } from './app-login/app-login.component';
import { ChatbotService } from './services/chatbot.service';
import { CuentaComponent } from './app-cuenta/cuenta-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ToastComponent,
    CuentaComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'frontend-inv';
  searchQuery: string = '';

  mostrarCuenta = false;
  jugadorNombre: string = localStorage.getItem('username') || '';
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

  user: User = new User();

  role: string = localStorage.getItem('role') || '';

  isBattleRoute = false;

  isAccountPanelVisible = false;

  constructor(
    public router: Router,
    private chatService: ChatService,
    private chatbotService: ChatbotService,
    private itemService: ItemsService,
    private heroService: HeroesService,
    private armorService: ArmorsService,
    private epicsService: EpicsService,
    private weaponService: WeaponsService,
    public loginService: LoginService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isBattleRoute = event.urlAfterRedirects.startsWith('battle');
      }
    });
  }

  isLoginOpen = false;

  openLogin() {
    this.isLoginOpen = true;
  }

  isRole(): boolean {
    return this.loginService.getRole() === 'administrator';
  }

  onControl() {
    this.router.navigate(['/gestion']);
  }

  ngOnInit() {
    // Traer todos los datos una sola vez
    this.itemService.showAllItems().subscribe({
      next: (data) => {
        this.allItems = data;
        this.items = data;
      },
      error: (err) => console.error('Error cargando items:', err),
    });

    this.heroService.showAllIHeros().subscribe({
      next: (data) => {
        this.allHeroes = data;
        this.heroes = data;
      },
      error: (err) => console.error('Error cargando heroes:', err),
    });

    this.armorService.showAllIArmors().subscribe({
      next: (data: Armor[]) => {
        this.allArmors = data;
        this.armors = data;
      },
      error: (err: any) => console.error('Error cargando armaduras:', err),
    });

    this.epicsService.showAllIEpics().subscribe({
      next: (data: Epic[]) => {
        this.allEpics = data;
        this.epics = data;
      },
      error: (err: any) => console.error('Error cargando épicos:', err),
    });

    this.weaponService.showAllIWeapon().subscribe({
      next: (data: Weapon[]) => {
        this.allWeapons = data;
        this.weapons = data;
      },
      error: (err: any) => console.error('Error cargando armas:', err),
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

  onAuction() {
    this.router.navigate(['/auctions']);
  }

  onTournament() {
    this.router.navigate(['/']);
  }

  onMission() {
    this.router.navigate(['/']);
  }

  onAccount() {
    this.router.navigate(['/cuenta']);
  }

  onComentarios() {
    this.router.navigate(['/comentarios']);
  }

  toggleCuenta() {
    this.mostrarCuenta = !this.mostrarCuenta;
  }

  onSearchChange(): void {
    const query = this.searchQuery.trim().toLowerCase();

    // si no hay texto o menos de 4 caracteres → no mostrar nada
    if (!query || query.length < 4) {
      this.items = [];
      this.heroes = [];
      this.armors = [];
      this.epics = [];
      this.weapons = [];
      return;
    }

    // función para buscar en todo el objeto
    const matchesQuery = (obj: any): boolean => {
      return JSON.stringify(obj).toLowerCase().includes(query);
    };

    this.items = this.allItems.filter((i) => matchesQuery(i));
    this.heroes = this.allHeroes.filter((h) => matchesQuery(h));
    this.armors = this.allArmors.filter((a) => matchesQuery(a));
    this.epics = this.allEpics.filter((e) => matchesQuery(e));
    this.weapons = this.allWeapons.filter((w) => matchesQuery(w));
  }

  onClickItem(item: any) {
    if (!item) return;

    const knownArmorTypes = ['HELMET', 'CHEST', 'GLOVERS', 'BRACERS', 'PANTS', 'BOOTS'];
    let tipo: 'item' | 'armor' | 'weapon' = 'item';

    if (item.weaponType) tipo = 'weapon';
    else if (item.armorType && knownArmorTypes.includes(item.armorType)) tipo = 'armor';

    const id =
      item.itemId ??
      item.id ??
      item._id ??
      item.weaponId ??
      item.armorId;

    if (!id) {
      console.warn('[App] ID inválido para comentarios', item);
      return;
    }

    console.debug('[App] abrir comentarios desde buscador', { tipo, id, name: item.name });

    // Reutiliza el mismo evento que entiende comments-root
    window.dispatchEvent(new CustomEvent('open-comments', { detail: { tipo, id, name: item.name } }));
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

  goToGestion(option: string) {
    switch (option) {
      case 'heroes':
        this.router.navigate(['/heroes/control']);
        break;

      case 'items':
        this.router.navigate(['/items/control']);
        break;

      case 'weapons':
        this.router.navigate(['/weapons/control']);
        break;

      case 'armors':
        this.router.navigate(['/armors/control']);
        break;

      case 'epics':
        this.router.navigate(['/epics/control']);
        break;

      default:
        console.warn('Opción de gestión no reconocida:', option);
        break;
    }
  }


  // Estado del chatbot
  chatbotVisible = false;
  chatbotMessages: { from: 'user' | 'bot'; text: string }[] = [];
  chatbotInput: string = '';
  isProcessing = false; // indicador de procesamiento

  // Sugerencias iniciales separadas
  chatbotSuggestions: string[] = [
    'colores de la barra de vida',
    'cómo hago una subasta',
    'cómo ganar créditos',
    'escudo de dragón efectos'
  ];

  // --- Chatbot Hover ---
  toggleChatbot() {
    this.chatbotVisible = !this.chatbotVisible;
  }

  sendSuggestion(suggestion: string) {
    // cuando el usuario hace click en una sugerencia
    this.chatbotInput = suggestion;
    this.sendChatMessage();
  }

  sendChatMessage() {
    const msg = this.chatbotInput.trim();
    if (!msg) return;

    // agregar mensaje del usuario
    this.chatbotMessages.push({ from: 'user', text: msg });
    this.chatbotInput = '';
    this.isProcessing = true;

    // limpiar sugerencias al enviar mensaje
    this.chatbotSuggestions = [];

    // llamar al backend usando ChatbotService
    this.chatbotService.sendMessage(msg).subscribe({
      next: (res) => {
        this.chatbotMessages.push({ from: 'bot', text: res.reply });
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Error en chatbot:', err);
        this.chatbotMessages.push({ from: 'bot', text: '⚠️ Error al conectar con el servidor.' });
        this.isProcessing = false;
      }
    });
  }






}

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { ItemRef } from '../../domain/auction.model';
import { ItemsService } from '../../services/items.service';
import { firstValueFrom } from 'rxjs';
import { Item } from '../../domain/item.model';
import { UsuarioService } from '../../services/usuario.service';
import User from '../../domain/user.model';

export interface CreateAuctionInput {
  startingPrice: number;
  buyNowPrice: number | null;
  durationHours: number;
  itemId?: string;
}

@Component({
  selector: 'app-create-auction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-auction-form.component.html',
  styleUrls: ['./create-auction-form.component.css']
})
export class CreateAuctionFormComponent {
  @Output() create = new EventEmitter<CreateAuctionInput>();

  availableItems: { id: string; name: string }[] = [];
  itemId?: string;
  allItems: ItemRef[] = [];

  form: CreateAuctionInput = { startingPrice: 0, buyNowPrice: null, durationHours: 24 };
  loading = true;

  constructor(private auctionService: AuctionService, private router: Router, private itemsService: ItemsService, private usuarioService: UsuarioService) {
    this.loadUserItems();
  }

  async loadUserItems() {
    try {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('Usuario no logueado');

      // 🚨 Llamamos solo a los items del usuario logueado
      const userItems = await this.auctionService.getUserItems(username);
      this.availableItems = userItems.map(i => ({ id: i.id, name: i.name ?? 'Sin nombre' }));

      if (userItems.length > 0) this.itemId = userItems[0].id;

    } catch (err) {
      console.error('Error cargando items:', err);
    } finally {
      this.loading = false;
    }
  }

  handleInputChange(field: keyof Omit<CreateAuctionInput, 'itemId'>, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value ? Number(target.value) : null;
    if (field === 'buyNowPrice') this.form.buyNowPrice = value;
    if (field === 'startingPrice') this.form.startingPrice = value ?? 0;
    if (field === 'durationHours') this.form.durationHours = value ?? 24;
  }

  async submit() {
  if (!this.itemId) return alert('Selecciona un item primero');

  const selected = this.allItems.find(i => i.id === this.itemId);
  if (!selected) return alert('Item no válido');

  const payload = { 
    ...this.form, 
    itemId: this.itemId, 
    itemType: selected.type // 👈 ahora sí viaja al back
  };

  try {
    const auction = await this.auctionService.createAuction(payload);
    console.log('Subasta creada:', auction);
    alert('Subasta creada correctamente');
  } catch (err) {
    console.error('Error creando la subasta:', err);
    alert('No se pudo crear la subasta');
  }
}


  // 🔹 Métodos de navegación
  goToComprar() { this.router.navigate(['/auctions']); }
  goToVender() { this.router.navigate(['/auctions/vender']); }
  goToRecoger() { this.router.navigate(['/auctions/recoger']); }
  goToMisPujas() { this.router.navigate(['/auctions/mis-pujas']); }


filterByCategory(category: string): void {
  this.loading = true;

  // Siempre leemos el username desde localStorage
  const username = localStorage.getItem('username');

  if (!username) {
    console.error("❌ No se encontró username en localStorage");
    this.loading = false;
    return;
  }

  console.log("✅ Username encontrado en localStorage:", username);
  console.log("📡 Pidiendo datos de usuario al backend...");

  this.usuarioService.getUsuarioById(username).subscribe({
    next: (usuario: User) => {
      console.log("✅ Usuario recibido del backend:", usuario);

      let items: any[] = [];
const inv = usuario.inventario || {}; // 👈 asegura que no sea undefined/null

switch (category) {
  case 'armas':
    items = inv.weapons || [];
    break;
  case 'armaduras':
    items = inv.armors || [];
    break;
  case 'items':
    items = inv.items || [];
    break;
  case 'epicas':
    items = inv.epicAbility || [];
    break;
  case 'heroes':
    items = inv.hero || [];
    break;
  case 'all':
  default:
    items = [
      ...(inv.weapons || []),
      ...(inv.armors || []),
      ...(inv.items || []),
      ...(inv.epicAbility || []),
      ...(inv.hero || [])
    ];
    break;
}


      // Normalizamos IDs a string
      this.allItems = items.map(i => ({
  ...i,
  id: String(i.id),
  type: category, // 👈 injectamos la categoría
  imagen: i.image || 'https://via.placeholder.com/150'
})) as ItemRef[];


      console.log("🎯 Items normalizados listos para renderizar:", this.allItems);

      this.loading = false;
    },
    error: (err: any) => {
      console.error("❌ Error cargando inventario:", err);
      this.loading = false;
    }
  });
}

}
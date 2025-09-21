import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { ItemRef } from '../../domain/auction.model';
import { ItemsService } from '../../services/items.service';
import { firstValueFrom } from 'rxjs';
import { Item } from '../../domain/item.model';

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

  constructor(private auctionService: AuctionService, private router: Router, private itemsService: ItemsService) {
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
    const payload = { ...this.form, itemId: this.itemId };
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


  filterByCategory(_category: string): void {
    this.loading = true;
    this.itemsService.showAllItems().subscribe({
      next: (items: Item[]) => {
        // 👇 Convertimos Item → ItemRef
        this.allItems = items.map(i => ({
          ...i,
          id: String(i.id) // 🔹 forzamos id a string
        })) as ItemRef[];

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando items:', err);
        this.loading = false;
      }
    });
  }
}
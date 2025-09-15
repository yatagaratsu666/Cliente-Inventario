import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { ItemRef } from '../../domain/auction.model';

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
})
export class CreateAuctionFormComponent {
  @Output() create = new EventEmitter<CreateAuctionInput>();

  availableItems: { id: string; name: string }[] = [];
  itemId?: string;
  allItems: ItemRef[] = [];

  form: CreateAuctionInput = {
    startingPrice: 0,
    buyNowPrice: null,
    durationHours: 24,
  };

  loading = true;

  constructor(private auctionService: AuctionService) {
    this.loadUserItems();
  }

  async loadUserItems() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('Usuario no logueado');

      // Traer todos los items desde el backend
      const allItems: ItemRef[] = await this.auctionService.getAllItems();
      console.log('Todos los items raw del backend:', allItems);

      // Guardar todos los items
      this.allItems = allItems;

      // Filtrar solo los items disponibles del usuario
      const userItems = allItems.filter(
        i => i.userId && String(i.userId) === userId && i.isAvailable
      );

      // Transformar a {id, name} solo para la vista
      this.availableItems = userItems.map(i => ({
        id: String(i.id),
        name: i.name ?? 'Sin nombre',
      }));

      // Preseleccionar el primer item si hay alguno
      if (userItems.length > 0) {
        this.itemId = String(userItems[0].id);
      }

      console.log('Items filtrados para el usuario:', this.availableItems);
    } catch (err) {
      console.error('Error cargando items:', err);
    } finally {
      this.loading = false;
    }
  }

  handleInputChange(field: keyof Omit<CreateAuctionInput, 'itemId'>, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value ? Number(target.value) : null;

    switch (field) {
      case 'buyNowPrice':
        this.form.buyNowPrice = value;
        break;
      case 'startingPrice':
        this.form.startingPrice = value ?? 0;
        break;
      case 'durationHours':
        this.form.durationHours = value ?? 24;
        break;
    }
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

}

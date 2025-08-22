import { Component } from '@angular/core';
import { Item } from '../../domain/item.model';
import { ItemsService } from '../../services/items.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-gestion-item',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './app-gestion-item.component.html',
  styleUrl: './app-gestion-item.component.css',
})
export class AppGestionItemComponent {
  items: Item[] = [];

  constructor(private router: Router, private itemService: ItemsService) {}

  ngOnInit(): void {
    this.showItems();
  }

  showItems(): void {
    this.itemService.showAllItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        alert('No se pudo obtener la lista de items.');
      },
    });
  }

  addItem(): void {
    this.router.navigate(['/items/create']);
  }

  changeStatus(id: number): void {
    this.itemService.changeStatus(id).subscribe({
      next: () => {
        const item = this.items.find((i) => i.id === id);
        if (item) {
          item.status = !item.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del item:', error);
        alert('No se pudo cambiar el estado del item.');
      },
    });
  }

  modifyItem(id: number): void {
    this.router.navigate(['/items/modify', id]);
  }
}

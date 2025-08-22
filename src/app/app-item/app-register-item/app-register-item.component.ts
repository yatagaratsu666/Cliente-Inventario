import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../services/items.service';
import { Item, HeroType } from '../../domain/item.model';
import { Effect, EffectType } from '../../domain/effect.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-register-item',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-item.component.html',
  styleUrl: './app-register-item.component.css',
})
export class AppRegisterItemComponent {
  heroTypes = Object.values(HeroType);
  effectTypes = Object.values(EffectType);
  item: Item = {
    id: 0,
    image: '',
    heroType: HeroType.TANK,
    description: '',
    name: '',
    status: true,
    effects: [
      { effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 },
    ],
    dropRate: 0,
  };

  selectedFile?: File;

  constructor(private itemsService: ItemsService, private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  validate(): boolean {
    const { name, description, dropRate, heroType, effects } = this.item;

    return !!(
      name &&
      description &&
      dropRate &&
      heroType &&
      effects?.length &&
      effects[0].durationTurns &&
      effects[0].effectType &&
      effects[0].value
    );
  }

  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos deben ser obligatorios');
    } else {
      const itemConId = { ...this.item, id: 0 };

      this.itemsService.createItem(itemConId, this.selectedFile).subscribe({
        next: (newItem) => {
          console.log('Item creado con éxito:', newItem);
          this.router.navigate(['/items/control']);
        },
        error: (err) => {
          console.error('Error al crear item:', err);
        },
      });
    }
  }
}

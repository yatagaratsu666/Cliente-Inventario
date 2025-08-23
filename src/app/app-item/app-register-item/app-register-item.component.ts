import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../services/items.service';
import { Item, HeroType } from '../../domain/item.model';
import { Effect, EffectType } from '../../domain/effect.model';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
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
    stock: 0,
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
    if (!this.selectedFile) {
      console.log(`Debes seleccionar una imagen`);
      return false;
    }
    const { name, description, stock, dropRate, heroType, effects } = this.item;

    return !!(
      name &&
      description &&
      dropRate &&
      heroType &&
      stock >= -1 &&
      effects?.length &&
      effects[0].durationTurns &&
      effects[0].effectType &&
      effects[0].value
    );
  }

private showAlert(icon: any, title: string, text: string, buttonColor: string = '#3085d6') {
  Swal.fire({ icon, title, text, confirmButtonColor: buttonColor });
}

onSubmit(): void {
  if (!this.validate()) {
    this.showAlert('warning', 'Campos incompletos', 'Todos los campos son obligatorios');
  } else {
    const itemConId = { ...this.item, id: 0 };

    this.itemsService.createItem(itemConId, this.selectedFile).subscribe({
      next: () => {
        this.showAlert('success', '¡Éxito!', 'Item creado con éxito');
        this.router.navigate(['/items/control']);
      },
      error: (err) => {
        this.showAlert('error', 'Error', 'Hubo un problema al crear el item', '#d33');
        console.error('Error al crear item:', err);
      },
    });
  }
}

}

import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-app-register-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-weapon.component.html',
  styleUrl: './app-register-weapon.component.css',
})
export class AppRegisterWeaponComponent {
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
  weapon: Weapon = {
    id: 0,
    image: '',
    description: '',
    name: '',
    heroType: HeroType.TANK,
    status: true,
    stock: 0,
    effects: [
      { effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 },
    ],
    dropRate: 0,
  };

  selectedFile?: File;

  constructor(private weaponService: WeaponsService, private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  validate(): boolean {
    if (!this.selectedFile) {
      console.error('Debes seleccionar una imagen');
      return false;
    }
    const { name, description, dropRate, heroType, stock, effects } =
      this.weapon;

    return !!(
      name &&
      description &&
      dropRate &&
      heroType &&
      stock &&
      stock >= -1 &&
      effects?.length &&
      effects[0].durationTurns &&
      effects[0].effectType &&
      effects[0].value
    );
  }

  private showAlert(
    icon: any,
    title: string,
    text: string,
    buttonColor: string = '#3085d6'
  ) {
    Swal.fire({ icon, title, text, confirmButtonColor: buttonColor });
  }

  onSubmit(): void {
    if (!this.validate()) {
      this.showAlert('warning', 'Campos incompletos', 'Todos los campos son obligatorios');
    } else {
      const weaponConId = { ...this.weapon, id: 0 };

      this.weaponService
        .createWeapon(weaponConId, this.selectedFile)
        .subscribe({
          next: () => {
            this.showAlert('success', '¡Éxito!', 'Item creado con éxito');
            this.router.navigate(['/weapons/control']);
          },
          error: (err) => {
            this.showAlert('error', 'Error', 'Hubo un problema al crear el item', '#d33');
            console.error('Error al crear arma:', err);
          },
        });
    }
  }
}

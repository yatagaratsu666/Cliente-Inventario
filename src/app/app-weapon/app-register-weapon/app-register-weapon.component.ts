import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';

@Component({
  selector: 'app-app-register-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-weapon.component.html',
  styleUrl: './app-register-weapon.component.css'
})
export class AppRegisterWeaponComponent {
  weapon: Weapon = {
    id: 0,
    image: '',
    description: '',
    name: '',
    status: true,
    effects: [
      { effectType: '', value: 0, durationTurns: 0 },
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
    const { name, description, dropRate, effects } = this.weapon;

    return !!(
      name &&
      description &&
      dropRate &&
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
      const weaponConId = { ...this.weapon, id: 0 };

      this.weaponService.createWeapon(weaponConId, this.selectedFile).subscribe({
        next: (newWeapon) => {
          console.log('Arma creada con éxito:', newWeapon);
          this.router.navigate(['/weapons/control']);
        },
        error: (err) => {
          console.error('Error al crear arma:', err);
        },
      });
    }
  }
}

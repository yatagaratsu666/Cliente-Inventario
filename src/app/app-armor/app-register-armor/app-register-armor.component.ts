import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Armor } from '../../domain/armor.model';
import { ArmorsService } from '../../services/armors.service';
import { EffectType } from '../../domain/effect.model';

@Component({
  selector: 'app-app-register-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-armor.component.html',
  styleUrl: './app-register-armor.component.css'
})
export class AppRegisterArmorComponent {
  effectTypes = Object.values(EffectType);
  armor: Armor = {
    id: 0,
    image: '',
    description: '',
    name: '',
    status: true,
    effects: [
      { effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 },
    ],
    dropRate: 0,
  };

  selectedFile?: File;

  constructor(private armorService: ArmorsService, private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  validate(): boolean {
    const { name, description, dropRate, effects } = this.armor;

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
      const armorConId = { ...this.armor, id: 0 };

      this.armorService.createArmor(armorConId, this.selectedFile).subscribe({
        next: (newArmor) => {
          console.log('Armadura creada con éxito:', newArmor);
          this.router.navigate(['/armors/control']);
        },
        error: (err) => {
          console.error('Error al crear armadura:', err);
        },
      });
    }
  }
}

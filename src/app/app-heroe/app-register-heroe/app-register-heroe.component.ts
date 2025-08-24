import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Hero, { HeroType } from '../../domain/heroe.model';
import { HeroesService } from '../../services/heroes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EffectType } from '../../domain/effect.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-app-register-heroe',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-heroe.component.html',
  styleUrl: './app-register-heroe.component.css'
})
export class AppRegisterHeroeComponent {
  heroTypes = Object.values(HeroType);
  heroId: number = 0;
  effectTypes = Object.values(EffectType);
  hero: Hero = new Hero(
    '', // image
    '', // name
    HeroType.TANK, // heroType
    '', // description
    1,  // level
    0,  // power
    0,  // health
    0,  // defense
    true,
    0,
    0,  // attack
    { min: 0, max: 0 }, // attackBoost
    { min: 0, max: 0 }, // damage
    [
      { 
        name: 'default', 
        actionType: 'default', 
        powerCost: 0, 
        cooldown: 0, 
        isAvailable: true 
      }
    ],
    0, // id
    [{ effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 }]
  );

  selectedFile?: File;

  constructor(private heroesService: HeroesService, private router: Router) {}

  // Captura el archivo seleccionado
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
    const { name, description, heroType, level, stock, attack, health, defense, power, specialActions } = this.hero;

    if (!name || !description || !heroType || level < 0 || stock < -1|| attack < 0 || health < 0 || defense < 0 || power < 0) {
      return false;
    }

    for (const effect of this.hero.effects) {
        if (!effect.effectType || effect.value === null || effect.durationTurns < 0) {
          return false;
        }
    }

    if (!specialActions?.length) return false;

    for (const action of specialActions) {
      if (!action.name || !action.actionType || action.powerCost < 0) {
        return false;
      }
    }

    return true;
  }

  private showAlert(icon: any, title: string, text: string, buttonColor: string = '#3085d6') {
    Swal.fire({ icon, title, text, confirmButtonColor: buttonColor });
  }

  onSubmit(): void {
    if (!this.validate()) {
      this.showAlert('warning', 'Campos incompletos', 'Todos los campos son obligatorios');
    } else {
      const heroToCreate = { ...this.hero, id: 0 };

      this.heroesService.createHero(heroToCreate, this.selectedFile).subscribe({
        next: () => {
          this.showAlert('success', '¡Éxito!', 'Item creado con éxito');
          this.router.navigate(['/heroes/control']);
        },
        error: (err) => {
          this.showAlert('error', 'Error', 'Hubo un problema al crear el item', '#d33');
          console.error('Error al crear heroe:', err);
        },
      });
    }
  }
}

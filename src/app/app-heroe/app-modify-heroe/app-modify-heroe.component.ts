import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeroesService } from '../../services/heroes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Hero from '../../domain/heroe.model';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/heroe.model';

@Component({
  selector: 'app-app-modify-heroe',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-heroe.component.html',
  styleUrl: './app-modify-heroe.component.css'
})
export class AppModifyHeroeComponent {
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
        effects: [{ effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 }], 
        cooldown: 0, 
        isAvailable: true 
      }
    ],
    0 // id
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private heroService: HeroesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.heroId = id ? +id : 0;

    if (this.heroId) {
      this.loadHero(this.heroId);
    }
  }

  loadHero(id: number): void {
    this.heroService.getHeroById(id).subscribe({
      next: (data) => {
        this.hero = data;
      },
      error: (error) => {
        console.error('Error al cargar héroe:', error);
        alert('No se pudo obtener los datos del héroe.');
      }
    });
  }

  readImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.hero.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  validate(): boolean {
    const { name, description, heroType, level, stock, attack, health, defense, power, specialActions } = this.hero;

    if (!name || !description || !heroType || level < 0 || stock < -1|| attack < 0 || health < 0 || defense < 0 || power < 0) {
      return false;
    }

    if (!specialActions?.length) return false;

    for (const action of specialActions) {
      if (!action.name || !action.actionType || action.powerCost < 0 || !action.effects?.length) {
        return false;
      }
      for (const effect of action.effects) {
        if (!effect.effectType || effect.value === null || effect.durationTurns < 0) {
          return false;
        }
      }
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos.');
      return;
    }
    const { _id, ...itemToUpdate } = this.hero as any;

    this.heroService.updateHero(this.heroId, itemToUpdate).subscribe({
      next: () => {
        console.log('Héroe actualizado correctamente.');
        this.router.navigate(['/heroes/control']);
      },
      error: (error) => {
        console.error('Error al actualizar héroe:', error);
        alert('Error al actualizar el héroe. Inténtalo de nuevo.');
      }
    });
  }
}

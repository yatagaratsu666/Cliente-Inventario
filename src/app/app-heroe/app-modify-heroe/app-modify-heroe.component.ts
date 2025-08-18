import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeroesService } from '../../services/heroes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Hero from '../../domain/heroe.model';

@Component({
  selector: 'app-app-modify-heroe',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-heroe.component.html',
  styleUrl: './app-modify-heroe.component.css'
})
export class AppModifyHeroeComponent {
  heroId: number = 0;

  hero: Hero = new Hero(
    '', // image
    '', // name
    '', // heroType
    '', // description
    1,  // level
    0,  // power
    0,  // health
    0,  // defense
    true,
    0,  // attack
    { min: 0, max: 0 }, // attackBoost
    { min: 0, max: 0 }, // damage
    [
      { 
        name: '', 
        actionType: '', 
        powerCost: 0, 
        effects: [{ effectType: '', value: 0, durationTurns: 0 }], 
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
        if (!data.specialActions || data.specialActions.length === 0) {
          data.specialActions = [
            { 
              name: '', 
              actionType: '', 
              powerCost: 0, 
              effects: [{ effectType: '', value: 0, durationTurns: 0 }], 
              cooldown: 0, 
              isAvailable: true 
            }
          ];
        }
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
    const { name, description, heroType, specialActions } = this.hero;

    return !!(
      name &&
      description &&
      heroType &&
      specialActions?.length &&
      specialActions[0].effects?.length &&
      specialActions[0].effects[0].durationTurns !== undefined &&
      specialActions[0].effects[0].effectType &&
      specialActions[0].effects[0].value !== undefined
    );
  }

  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos.');
      return;
    }

    this.heroService.updateItem(this.heroId, this.hero).subscribe({
      next: () => {
        console.log('Héroe actualizado correctamente.');
        this.router.navigate(['/heroes']);
      },
      error: (error) => {
        console.error('Error al actualizar héroe:', error);
        alert('Error al actualizar el héroe. Inténtalo de nuevo.');
      }
    });
  }
}

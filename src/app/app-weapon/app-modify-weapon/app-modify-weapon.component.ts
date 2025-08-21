import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';

@Component({
  selector: 'app-app-modify-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-weapon.component.html',
  styleUrl: './app-modify-weapon.component.css'
})
export class AppModifyWeaponComponent {
  weaponId: number = 0;
  weapon: Weapon = {
    id: 0,
    name: '',
    description: '',
    dropRate: 0,
    image: '',
    status: false,
    effects: [{ effectType: '', value: 0, durationTurns: 0 }],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weaponService: WeaponsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.weaponId = id ? +id : 0;

    if (this.weaponId) {
      this.loadWeapon(this.weaponId);
    }
  }

  readImage(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.weapon.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  loadWeapon(id: number): void {
    this.weaponService.getWeaponById(id).subscribe({
      next: (data) => {
        if (!data.effects || data.effects.length === 0) {
          data.effects = [{ effectType: '', value: 0, durationTurns: 0 }];
        }
        this.weapon = data;
      },
      error: (error) => {
        console.error('Error al cargar armas:', error);
        alert('No se pudo obtener los datos del armas.');
      },
    });
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

  setImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.weapon.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos.');
      return;
    } else {
      const { _id, ...itemToUpdate } = this.weapon as any;

      this.weaponService.updateWeapon(this.weaponId, itemToUpdate).subscribe({
        next: () => {
          console.log('Arma actualizada correctamente.');
          this.router.navigate(['/weapons/control']);
        },
        error: (error) => {
          console.error('Error al actualizar arma:', error);
          alert('Error al actualizar item. Inténtalo de nuevo.');
        },
      });
    }
  }
}

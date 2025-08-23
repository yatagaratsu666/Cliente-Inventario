import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Armor, ArmorType } from '../../domain/armor.model';
import { ArmorsService } from '../../services/armors.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';

@Component({
  selector: 'app-app-modify-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-armor.component.html',
  styleUrl: './app-modify-armor.component.css'
})
export class AppModifyArmorComponent {
  armorId: number = 0;
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
  armorTypes = Object.values(ArmorType);
  armor: Armor = {
    id: 0,
    name: '',
    description: '',
    armorType: ArmorType.HELMET,
    heroType: HeroType.TANK,
    dropRate: 0,
    image: '',
    status: false,
    stock: 0,
    effects: [{ effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 }],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private armorService: ArmorsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.armorId = id ? +id : 0;

    if (this.armorId) {
      this.loadWeapon(this.armorId);
    }
  }

  readImage(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.armor.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  loadWeapon(id: number): void {
    this.armorService.getArmorById(id).subscribe({
      next: (data) => {
        this.armor = data;
      },
      error: (error) => {
        console.error('Error al cargar armaduras:', error);
        alert('No se pudo obtener los datos del armaduras.');
      },
    });
  }

  validate(): boolean {
    const { name, description, stock, dropRate, effects } = this.armor;

    return !!(
      name &&
      description &&
      dropRate &&
      stock >= -1 &&
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
      reader.onload = () => (this.armor.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos.');
      return;
    } else {
      const { _id, ...armorToUpdate } = this.armor as any;

      this.armorService.updateArmor(this.armorId, armorToUpdate).subscribe({
        next: () => {
          console.log('Armadura actualizada correctamente.');
          this.router.navigate(['/armors/control']);
        },
        error: (error) => {
          console.error('Error al actualizar armadura:', error);
          alert('Error al actualizar armadura. Inténtalo de nuevo.');
        },
      });
    }
  }
}

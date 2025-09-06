import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Armor, ArmorType } from '../../domain/armor.model';
import { ArmorsService } from '../../services/armors.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';

/**
 * Componente encargado de la modificación de armaduras existentes.
 * Permite cargar una armadura desde el backend, editar sus datos y
 * enviar las actualizaciones.
 *
 * Características principales:
 * - Obtiene una armadura por ID desde el backend.
 * - Permite actualizar campos como nombre, tipo, efectos, imagen y stock.
 * - Valida que los campos requeridos estén completos antes de guardar.
 */

@Component({
  selector: 'app-app-modify-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-armor.component.html',
  styleUrl: './app-modify-armor.component.css'
})
export class AppModifyArmorComponent {
  //ID de la armadura que se modificara
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
  ) { }

  /**
 * Obtiene el ID desde la ruta y carga la armadura correspondiente.
 */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.armorId = id ? +id : 0;

    if (this.armorId) {
      this.loadWeapon(this.armorId);
    }
  }

    /**
   * Lee una imagen desde el input file y la asigna al modelo de la armadura.
   * @param event Evento de selección de archivo.
   */
  readImage(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.armor.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

    /**
   * Carga la información de una armadura desde el backend.
   * @param id ID de la armadura a cargar.
   */
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

    /**
   * Valida que los campos obligatorios de la armadura sean correctos.
   * @returns `true` si los datos son válidos, `false` en caso contrario.
   */
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

    /**
   * Alias de readImage, permite actualizar la imagen desde el input file.
   * @param event Evento de selección de archivo.
   */
  setImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.armor.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

    /**
   * Envía la actualización de la armadura al backend.
   * Si los datos no son válidos, muestra un mensaje de error.
   */
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

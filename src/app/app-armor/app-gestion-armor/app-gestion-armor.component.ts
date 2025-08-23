import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Armor } from '../../domain/armor.model';
import { ArmorsService } from '../../services/armors.service';

@Component({
  selector: 'app-app-gestion-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-armor.component.html',
  styleUrl: './app-gestion-armor.component.css'
})
export class AppGestionArmorComponent {
  armor: Armor[] = [];

  constructor(private router: Router, private armorService: ArmorsService) {}

  ngOnInit(): void {
    this.showArmors();
  }

   addArmor(): void {
    this.router.navigate(['/armors/create']);
  }

  showArmors(): void {
    this.armorService.showAllIArmors().subscribe({
      next: (data) => {
        this.armor = data;
      },
      error: (error) => {
        console.error('Error al cargar armaduras:', error);
        alert('No se pudo obtener la lista de armaduras.');
      },
    });
  }

  changeStatus(id: number): void {
    this.armorService.changeStatus(id).subscribe({
      next: () => {
        const armor = this.armor.find((i) => i.id === id);
        if (armor) {
          armor.status = !armor.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del armadura:', error);
        alert('No se pudo cambiar el estado del armadura.');
      },
    });
  }

  modifyArmor(id: number): void {
    this.router.navigate(['/armors/modify', id]);
  }
}

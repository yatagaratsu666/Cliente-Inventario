import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-gestion-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-weapon.component.html',
  styleUrl: './app-gestion-weapon.component.css'
})
export class AppGestionWeaponComponent {
  weapon: Weapon[] = [];

  constructor(private router: Router, private weaponService: WeaponsService) {}

  ngOnInit(): void {
    this.showWeapons();
  }

  addWeapon(): void {
    this.router.navigate(['/weapons/create']);
  }

  showWeapons(): void {
    this.weaponService.showAllIWeapon().subscribe({
      next: (data) => {
        this.weapon = data;
      },
      error: (error) => {
        console.error('Error al cargar armas:', error);
        alert('No se pudo obtener la lista de armas.');
      },
    });
  }

  changeStatus(id: number): void {
    this.weaponService.changeStatus(id).subscribe({
      next: () => {
        const weapon = this.weapon.find((i) => i.id === id);
        if (weapon) {
          weapon.status = !weapon.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del arma:', error);
        alert('No se pudo cambiar el estado del arma.');
      },
    });
  }

  modifyWeapon(id: number): void {
    this.router.navigate(['/weapons/modify', id]);
  }
}

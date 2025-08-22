import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-gestion',
  imports: [RouterModule, CommonModule],
  templateUrl: './app-gestion.component.html',
  styleUrl: './app-gestion.component.css'
})
export class AppGestionComponent {
  constructor(private router: Router) {}

  goToHeroes(): void {
    this.router.navigate(['/heroes/control']);
  }

  goToItems(): void {
    this.router.navigate(['/items/control']);
  }

  goToEpics(): void {
    this.router.navigate(['/epics/control']);
  }

  goToArmors(): void {
    this.router.navigate(['/armors/control']);
  }

  goToWeapons(): void {
    this.router.navigate(['/weapons/control']);
  }
}

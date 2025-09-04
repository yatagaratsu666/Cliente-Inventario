import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.css']
})
export class AppMenuComponent {

  constructor(private router: Router) { }

  onPlay() {
    this.router.navigate(['/battles']);
  }
}

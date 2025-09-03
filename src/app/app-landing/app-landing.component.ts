import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-landing.component.html',
  styleUrls: ['./app-landing.component.css']
})

export class AppLandingComponent {

  constructor(private router: Router) { }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onPlay() {
    this.router.navigate(['/battles']);
  }

}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'app-torneo',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-torneo.component.html',
  styleUrls: ['./app-torneo.component.css']
})
export class AppTorneoComponent {

  constructor(private router: Router) { }

  onInscripcion(){
    this.router.navigate(['/torneo/Inscripcion']);
  }

  onParticipar(){
    this.router.navigate(['/torneo']);
  } 
}

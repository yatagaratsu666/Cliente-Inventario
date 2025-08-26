// battle.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  imports: [CommonModule]
})
export class BattleComponent implements OnInit {
  roomId!: string;
  players: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.params['id'];
  }

}

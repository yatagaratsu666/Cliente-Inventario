// room-lobby.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-room-lobby',
  templateUrl: './rooms-lobby.component.html',
  styleUrls: ['./rooms-lobby.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RoomLobbyComponent implements OnInit, OnDestroy {
  roomId!: string;
  players: any[] = [];
  heroStats: any;
  id: string = localStorage.getItem('username') || '';
  team: string = 'A';
  private subs: Subscription[] = [];
  constructor(private route: ActivatedRoute, private router: Router, private battleService: BattleService) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.heroStats = this.battleService.getHeroStatsByPlayerId(this.id)

    const battleSub = this.battleService.listen<any>("battleStarted").subscribe(event => {
      this.battleService.setCurrentBattle(event);
      this.battleService.joinBattle(this.roomId, this.id);
      this.router.navigate([`/battle/${this.roomId}`]);
    });

    this.subs.push(battleSub);
  }

  

  onReady() {
    this.battleService.onReady(this.roomId, this.id, this.heroStats, this.team);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}

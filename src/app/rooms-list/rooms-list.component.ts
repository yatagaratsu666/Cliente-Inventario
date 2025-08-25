// rooms-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { Room } from '../domain/battle/room.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  imports: [CommonModule]
})
export class RoomsListComponent implements OnInit {
  rooms: any[] = [];
  playerId: string = 'ownerA';

  constructor(private battleService: BattleService, private router: Router) {}

  ngOnInit() {
    this.battleService.getRooms().subscribe(data => {
      console.log(data);
      this.rooms = data;
    });
    console.log(this.rooms);  
  }


  createRoom() {
    this.battleService.createRoom({
      id: 'ROOM_ID',
      mode: "1v1",
      allowAI: false,
      credits: 100,
      heroLevel: 1,
      ownerId: "ownerA",
    }).subscribe();
    console.log("Room created");
  }

  joinRoom(roomId: string) {
    const hero = this.battleService.getHeroStatsByPlayerId(this.playerId);
    this.battleService.joinRoom(roomId, this.playerId, hero.hero.level, hero).subscribe(() => {
      this.router.navigate(['/rooms', roomId]);
    });
  }

  getMaxPlayers(mode: string): number {
  switch (mode) {
    case "1v1":
      return 2;
    case "2v2":
      return 4;
    case "3v3":
      return 6;
    default:
      return 0;
  }
}

}

// battle.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html'
})
export class BattleComponent implements OnInit {
  roomId!: string;
  players: any[] = [];

  constructor(private route: ActivatedRoute, private socket: SocketService) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.params['id'];

    this.socket.listen<any>('battle:update').subscribe(update => {
      this.players = update.players;
    });

    // pedir estado inicial
    this.socket.emit('battle:get', { roomId: this.roomId });
  }

  attack(targetId: string) {
    this.socket.emit('battle:action', { roomId: this.roomId, action: 'attack', targetId });
  }
}

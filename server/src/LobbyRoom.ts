import { Client, Room } from 'colyseus';
import { Player, playerState } from './Models';

export type PlayersMap = { [id: string]: Player };

export interface LobbyRoomState {
  players: PlayersMap;
}

export abstract class LobbyRoom extends Room<LobbyRoomState> {
  mode: string = '';

  onInit(options: any) {
    this.setState({
      players: [],
    });
  }

  onJoin = (client: Client) => {
    /*creating new player and adding them to players list*/
    const newPlayer: Player = { id: client.sessionId, x: 0, y: 0, state: playerState.waiting };
    this.state.players[newPlayer.id] = newPlayer;
  };

  onLeave = (client: Client) => {
    /*remove player from players list*/
    delete this.state.players[client.sessionId];
  };

  onMessage = (client: Client, data: any) => {
    if (data.action === 'left') {
      this.state.players[client.sessionId].x -= 1;
    } else if (data.action === 'right') {
      this.state.players[client.sessionId].x += 1;
    }
  };

  onReady(client: Client) {
    this.state.players[client.sessionId].state = playerState.ready;
  }
}

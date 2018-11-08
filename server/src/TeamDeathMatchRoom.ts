import { Client, Room } from 'colyseus';
import { LobbyRoomState } from './LobbyRoom';
import { Player, playerState } from './Models';

export interface Team {
  id: number;
  players: string[];
}

export interface TeamDeathMatchState extends LobbyRoomState {
  teams: Team[];
}

export const NUMBER_OF_TEAMS = 2;

export class TeamDeathMatch extends Room<TeamDeathMatchState> {
  mode = 'TD';

  onInit(options: any) {
    this.setState({
      players: [],
      teams: [{ id: 1, players: [] }, { id: 2, players: [] }],
    });
  }

  /*-------------------------------------------------------------------
    Teams should be balanced in terms of amounts. 
    Allow a team to have up to one more player than the other team.
    Teams are sorted by amount of players
  --------------------------------------------------------------------*/
  onJoin = (client: Client) => {
    /*creating new player and adding them to players list*/
    const newPlayer: Player = { id: client.sessionId, x: 0, y: 0, state: playerState.waiting };
    this.state.players[newPlayer.id] = newPlayer;
    /*if all teams are equal in number of players add the player randomly to a team*/
    if (this.state.teams[0].players.length === this.state.teams[this.state.teams.length - 1].players.length) {
      const chosenTeam = this.randomize(NUMBER_OF_TEAMS);
      newPlayer.team = this.state.teams[chosenTeam].id;
      this.state.teams[chosenTeam].players.push(newPlayer.id);
    } else {
      /*add player to team shortest on players*/
      newPlayer.team = this.state.teams[0].id;
      this.state.teams[0].players.push(newPlayer.id);
      this.state.teams.sort((teamA: Team, teamB: Team) => (teamA.players.length > teamB.players.length ? 1 : -1));
    }
  };

  onLeave = (client: Client) => {
    const team: number | undefined = this.state.players[client.sessionId].team;
    /*remove player from team*/
    if (team) {
      const playerIndex = this.state.teams[team].players.findIndex((id: string) => id === client.sessionId);
      if (playerIndex !== -1) this.state.teams[team].players.splice(playerIndex, 1);
    }
    /*remove player from players list*/
    delete this.state.players[client.sessionId];
    this.state.teams.sort((teamA: Team, teamB: Team) => (teamA.players.length > teamB.players.length ? 1 : -1));
  };

  onMessage = (client: Client, data: any) => {
    if (data.action === 'left') {
      this.state.players[client.sessionId].x -= 1;
    } else if (data.action === 'right') {
      this.state.players[client.sessionId].x += 1;
    }
  };

  /*-------------------------------------------------------------------
    Teams should be balanced in terms of amounts. 
    Allow a team to have up to one more player than the other team.
    Teams are sorted by amount of players
  --------------------------------------------------------------------*/
  onChangeTeam = (client: Client, newTeamNumber: number) => {
    const newTeamIndex = this.state.teams.findIndex((team: Team) => team.id === newTeamNumber);
    if (this.state.teams[newTeamIndex].players.length > this.state.teams[0].players.length + 1) {
      return;
    }
    const team: number | undefined = this.state.players[client.sessionId].team;
    /*remove player from previous team*/
    if (team) {
      const index = this.state.teams[team].players.findIndex((id: string) => id === client.sessionId);
      this.state.teams[team].players.splice(index, 1);
    }
    /*add player to new team*/
    this.state.players[client.sessionId].team = newTeamNumber;
    this.state.teams[newTeamNumber].players.push(client.sessionId);
    this.state.teams.sort((teamA: Team, teamB: Team) => (teamA.players.length > teamB.players.length ? 1 : -1));
  };

  onReady(client: Client) {
    this.state.players[client.sessionId].state = playerState.ready;
  }

  randomize(numberOfTeams: number) {
    return Math.floor(Math.random() * numberOfTeams);
  }
}

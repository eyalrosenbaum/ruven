export enum playerState {
  offline = 0,
  waiting,
  ready,
}

export interface Player {
  id: string;
  x: number;
  y: number;
  state?: playerState;
  team?: number;
}

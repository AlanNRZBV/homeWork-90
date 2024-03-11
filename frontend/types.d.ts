export interface UserLine {
  tool: string;
  points: number[];
}

export interface IncomingDrawMessage {
  type: 'NEW_DRAWING';
  payload: UserLine[];
}

export type IncomingMessage = IncomingDrawMessage;

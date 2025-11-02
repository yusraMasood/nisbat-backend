export interface JwtPayload {
  sub: string;
  email?: string;
  roles?: string[];
}

declare module 'socket.io' {
  interface SocketData {
    user?: JwtPayload;
  }
}

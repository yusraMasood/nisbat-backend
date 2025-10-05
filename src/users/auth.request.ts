export interface AuthRequest {
  user: {
    sub: string;
    name: string;
    email: string;
  };
}

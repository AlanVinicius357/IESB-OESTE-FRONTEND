export type AuthAction =
  | { type: 'LOGIN'; payload: { email: string } }
  | { type: 'LOGOUT' };
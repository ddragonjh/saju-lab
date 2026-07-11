import type { IdentityResult } from '@shared/types';

export type AuthMode = IdentityResult['authMode'];

export interface IdentityProvider {
  initialize(): Promise<IdentityResult>;
  getUserId(): string | null;
  getAuthMode(): AuthMode;
  logout(): Promise<void>;
  deleteLocalData(): Promise<void>;
}

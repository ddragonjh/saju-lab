import { getAnonymousKey } from '@apps-in-toss/web-framework';
import type { IdentityResult } from '@shared/types';
import { AUTH_MODE, TOSS_LOGIN_ENABLED } from '../../config/appConfig';
import type { AuthMode, IdentityProvider } from './types';

const GUEST_KEY = 'uml_app_guest_id_v1';

function localUuid(): string {
  try {
    const existing = window.localStorage.getItem(GUEST_KEY);
    if (existing) return existing;
    const id = `guest_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
    window.localStorage.setItem(GUEST_KEY, id);
    return id;
  } catch {
    return `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export class GuestIdentityProvider implements IdentityProvider {
  private userId: string | null = null;

  async initialize(): Promise<IdentityResult> {
    this.userId = localUuid();
    return {
      userId: this.userId,
      authMode: 'guest',
      source: 'guest',
      message: '별도 회원가입 없이 이 기기에 임시로 저장되는 게스트 모드입니다.',
    };
  }

  getUserId(): string | null {
    return this.userId;
  }

  getAuthMode(): AuthMode {
    return 'guest';
  }

  async logout(): Promise<void> {
    this.userId = null;
  }

  async deleteLocalData(): Promise<void> {
    try {
      window.localStorage.removeItem(GUEST_KEY);
    } catch {
      // 저장소 접근 실패 시에도 앱 이용은 계속됩니다.
    }
    this.userId = null;
  }
}

export class AnonymousTossIdentityProvider implements IdentityProvider {
  private userId: string | null = null;
  private fallback = new GuestIdentityProvider();

  async initialize(): Promise<IdentityResult> {
    try {
      const result = await getAnonymousKey();
      if (result && typeof result === 'object' && result.type === 'HASH' && result.hash) {
        this.userId = `toss_${result.hash}`;
        return {
          userId: this.userId,
          authMode: 'anonymous-toss',
          source: 'toss',
          message: '토스에서 안전하게 이어서 보기: 별도 회원가입 없이 이용할 수 있어요.',
        };
      }
    } catch {
      // 앱인토스 외부 브라우저 또는 SDK 미지원 환경은 게스트로 계속 진행합니다.
    }
    const guest = await this.fallback.initialize();
    this.userId = guest.userId;
    return {
      ...guest,
      authMode: 'guest',
      message: '현재 환경에서는 앱인토스 익명 식별을 사용할 수 없어 게스트 모드로 이용합니다.',
    };
  }

  getUserId(): string | null {
    return this.userId;
  }

  getAuthMode(): AuthMode {
    return this.userId?.startsWith('toss_') ? 'anonymous-toss' : 'guest';
  }

  async logout(): Promise<void> {
    this.userId = null;
  }

  async deleteLocalData(): Promise<void> {
    await this.fallback.deleteLocalData();
    this.userId = null;
  }
}

export class TossLoginIdentityProvider implements IdentityProvider {
  private userId: string | null = null;

  async initialize(): Promise<IdentityResult> {
    if (!TOSS_LOGIN_ENABLED) {
      const guest = new GuestIdentityProvider();
      const result = await guest.initialize();
      this.userId = result.userId;
      return {
        ...result,
        authMode: 'guest',
        message: '사업자등록 전 출시 버전에서는 실제 토스 로그인 대신 익명 또는 게스트 식별만 사용합니다.',
      };
    }
    throw new Error('Toss login is intentionally disabled in the current free personal-developer build.');
  }

  getUserId(): string | null {
    return this.userId;
  }

  getAuthMode(): AuthMode {
    return 'toss-login';
  }

  async logout(): Promise<void> {
    this.userId = null;
  }

  async deleteLocalData(): Promise<void> {
    this.userId = null;
  }
}

export function createIdentityProvider(): IdentityProvider {
  if (AUTH_MODE === 'anonymous-toss') return new AnonymousTossIdentityProvider();
  if (AUTH_MODE === 'toss-login') return new TossLoginIdentityProvider();
  return new GuestIdentityProvider();
}

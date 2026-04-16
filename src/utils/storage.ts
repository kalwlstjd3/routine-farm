import { Storage } from '@apps-in-toss/web-framework';

declare global {
  interface Window {
    ReactNativeWebView?: unknown;
  }
}

function isLocalEnv(): boolean {
  return typeof window !== 'undefined' && !window.ReactNativeWebView;
}

/**
 * 토스앱 환경에서는 앱인토스 Storage를, 브라우저 개발 환경에서는 localStorage를 사용해요.
 */
export const AppStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isLocalEnv()) {
      return localStorage.getItem(key);
    }
    return Storage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isLocalEnv()) {
      localStorage.setItem(key, value);
      return;
    }
    return Storage.setItem(key, value);
  },
};

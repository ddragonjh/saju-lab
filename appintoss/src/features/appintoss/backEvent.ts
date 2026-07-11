import { graniteEvent } from '@apps-in-toss/web-framework';

export function registerBackHandler(handler: () => void): () => void {
  try {
    const unsubscribe = graniteEvent.addEventListener('backEvent', {
      onEvent: handler,
      onError: () => undefined,
    });
    return typeof unsubscribe === 'function' ? unsubscribe : () => undefined;
  } catch {
    return () => undefined;
  }
}

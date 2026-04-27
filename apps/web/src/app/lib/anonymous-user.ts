const ANONYMOUS_USER_STORAGE_KEY = 'polished.anonymousUserId';

function createAnonymousUserId() {
  return `anon_${crypto.randomUUID()}`;
}

export function getAnonymousUserId() {
  if (typeof window === 'undefined') {
    return createAnonymousUserId();
  }

  const existing = window.localStorage.getItem(ANONYMOUS_USER_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const next = createAnonymousUserId();
  window.localStorage.setItem(ANONYMOUS_USER_STORAGE_KEY, next);
  return next;
}

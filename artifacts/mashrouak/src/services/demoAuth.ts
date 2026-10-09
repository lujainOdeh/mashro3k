export type DemoRole = 'customer' | 'merchant' | 'courier';

export class DemoAuthError extends Error {
  constructor(public readonly code: 'secure-crypto-unavailable' | 'account-already-exists') {
    super(code);
    this.name = 'DemoAuthError';
  }
}

export type DemoUser = {
  id: string;
  role?: DemoRole;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  passwordSalt?: string;
  projectName?: string;
  projectCategory?: string;
};

type RegistrationDetails = {
  role: DemoRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  projectName?: string;
  projectCategory?: string;
};

const seedRoles: Record<string, DemoRole> = {
  'user-customer': 'customer',
  'user-merchant': 'merchant',
  'user-courier': 'courier',
};

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function encodeHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string) {
  if (!globalThis.crypto?.subtle) throw new DemoAuthError('secure-crypto-unavailable');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`));
  return encodeHex(new Uint8Array(digest));
}

export async function authenticateDemoUser(users: DemoUser[], role: DemoRole, identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const user = users.find((candidate) =>
    candidate.email.toLowerCase() === normalizedIdentifier
    || normalizePhone(candidate.phone) === normalizePhone(normalizedIdentifier),
  );
  if (!user || (user.role ?? seedRoles[user.id]) !== role) return null;

  const validPassword = seedRoles[user.id]
    ? password === 'demo123'
    : Boolean(user.passwordHash && user.passwordSalt && user.passwordHash === await hashPassword(password, user.passwordSalt));
  return validPassword ? user : null;
}

export async function createDemoAccount(users: DemoUser[], details: RegistrationDetails) {
  const email = details.email.trim().toLowerCase();
  const phone = details.phone.trim();
  if (users.some((user) => user.email.toLowerCase() === email || normalizePhone(user.phone) === normalizePhone(phone))) {
    throw new DemoAuthError('account-already-exists');
  }
  if (!globalThis.crypto?.getRandomValues || !globalThis.crypto?.randomUUID) throw new DemoAuthError('secure-crypto-unavailable');

  const saltBytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const passwordSalt = encodeHex(saltBytes);
  const passwordHash = await hashPassword(details.password, passwordSalt);

  return {
    id: `user-${details.role}-${globalThis.crypto.randomUUID()}`,
    role: details.role,
    name: details.name.trim(),
    email,
    phone,
    passwordHash,
    passwordSalt,
    ...(details.role === 'merchant' ? {
      projectName: details.projectName?.trim(),
      projectCategory: details.projectCategory?.trim(),
    } : {}),
  } satisfies DemoUser;
}

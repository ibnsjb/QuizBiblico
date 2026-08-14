const blockedNameTerms = [
  'caralho', 'cacete', 'porra', 'merda', 'bosta', 'foder', 'foda', 'fudido', 'fudida',
  'puta', 'puto', 'putaria', 'piranha', 'vagabunda', 'vagabundo', 'arrombado', 'arrombada',
  'cuzao', 'babaca', 'otario', 'idiota', 'imbecil', 'desgracado', 'desgracada', 'corno', 'corna',
  'buceta', 'boceta', 'xoxota', 'piroca', 'paunocu', 'filhadaputa', 'fdp', 'vaisefoder',
  'vsf', 'tomarnocu', 'tnc', 'viado', 'veado',
] as const;

const leetSubstitutions: Record<string, string> = {
  '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a', '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
  '@': 'a', '$': 's', '!': 'i', '+': 't',
};

export function normalizeNameForModeration(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split('')
    .map((character) => leetSubstitutions[character] ?? character)
    .join('')
    .replace(/[^a-z0-9]/g, '')
    .replace(/(.)\1+/g, '$1');
}

export function playerIdentityKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export type PlayerNameValidation =
  | { ok: true; name: string; key: string }
  | { ok: false; message: string };

export function validatePlayerName(rawValue: unknown): PlayerNameValidation {
  if (typeof rawValue !== 'string') {
    return { ok: false, message: 'Informe um nome válido.' };
  }

  const name = rawValue.trim().replace(/\s+/g, ' ');
  if (name.length < 2) return { ok: false, message: 'Use pelo menos 2 caracteres.' };
  if (name.length > 20) return { ok: false, message: 'Use no máximo 20 caracteres.' };
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 ._'-]+$/.test(name)) {
    return { ok: false, message: 'Use apenas letras, números, espaço, ponto, hífen, apóstrofo ou underline.' };
  }

  const normalized = normalizeNameForModeration(name);
  if (normalized.length < 2) return { ok: false, message: 'Informe um nome válido.' };
  if (blockedNameTerms.some((term) => normalized.includes(normalizeNameForModeration(term)))) {
    return { ok: false, message: 'Escolha outro nome. Conteúdo ofensivo não é permitido.' };
  }
  if (/(.)\1{5,}/.test(normalized)) {
    return { ok: false, message: 'Evite repetições excessivas de caracteres.' };
  }

  return { ok: true, name, key: playerIdentityKey(name) };
}

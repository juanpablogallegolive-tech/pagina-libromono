export const REGLAS_PASSWORD: { id: string; label: string; test: (p: string) => boolean }[] = [
  { id: 'longitud', label: 'Al menos 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'mayuscula', label: 'Una letra mayúscula', test: (p) => /[A-ZÁÉÍÓÚÑ]/.test(p) },
  { id: 'minuscula', label: 'Una letra minúscula', test: (p) => /[a-záéíóúñ]/.test(p) },
  { id: 'numero', label: 'Un número', test: (p) => /[0-9]/.test(p) },
];

export function passwordValida(p: string): boolean {
  return REGLAS_PASSWORD.every((r) => r.test(p));
}

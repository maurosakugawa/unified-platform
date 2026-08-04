export function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

export function normalizeCEP(cep) {
  return cep.replace(/\D/g, '').slice(0, 8);
}

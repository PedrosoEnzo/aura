// app/api.ts
export const API_URL = 'http://10.92.199.8:3000/api';

export async function login(email: string, senha: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  return res.json();
}

export async function cadastrarDispositivo(token: string, data: any) {
  const res = await fetch(`${API_URL}/dispositivos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

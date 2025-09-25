// app/api.ts

const API_URL = 'https://auone-backend.onrender.com/api';

// Interfaces para tipagem
interface Usuario {
  id: string;
  nome: string;
  email: string;
  profissao?: string;
  empresa?: string;
  foto?: string;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
  erro?: string;
}

interface DispositivoResponse {
  id: string;
  nome: string;
  deviceId: string;
  usuarioId: string;
  erro?: string;
}

// Função de login
export async function login(email: string, senha: string): Promise<LoginResponse> {
  try {
    const response: Response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.erro || 'Erro ao fazer login');
    return result as LoginResponse;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

// Função para cadastrar dispositivo
export async function cadastrarDispositivo(token: string, dispositivo: any): Promise<DispositivoResponse> {
  try {
    const response: Response = await fetch(`${API_URL}/dispositivos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dispositivo),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.erro || 'Erro ao cadastrar dispositivo');
    return result as DispositivoResponse;
  } catch (error) {
    console.error('Erro no cadastro de dispositivo:', error);
    throw error;
  }
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import dispositivosRoutes from './routes/dispositivos';
import sensoresRoutes from './routes/sensores';
import usuariosRoutes from './routes/usuario';
import perfilRoutes from './routes/perfil';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Libera acesso do frontend (ajuste se quiser restringir)
app.use(cors({
  origin: '*', // ou 'http://localhost:3000' se quiser limitar
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// ✅ Rotas organizadas por funcionalidade
app.use('/api/auth', authRoutes);           // ex: /api/auth/login
app.use('/api/dispositivos', dispositivosRoutes); // ex: /api/dispositivos
app.use('/api/sensores', sensoresRoutes);   // ex: /api/sensores
app.use('/api/usuarios', usuariosRoutes);   // ex: /api/usuarios/:id
app.use(perfilRoutes); // ex: /perfil

// ✅ Rota raiz para teste rápido
app.get('/', (req, res) => {
  res.send('🌿 API AUONE rodando com sucesso!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

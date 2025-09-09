import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dispositivosRoutes from './routes/dispositivos';
import sensoresRoutes from './routes/sensores';
import usuariosRoutes from './routes/usuario';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/sensores', sensoresRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
});

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'audne-secret';

// Adiciona CORS global para aceitar requisições do ESP32/Arduino
router.use(cors());

// Rota para receber dados dos sensores (ESP32 envia via POST quando tiver a bosta do app)
router.post('/sensores', async (req, res) => {
  try {
    // Não exige autenticação JWT
    const { deviceId, umidadeSolo, luminosidade, temperaturaSolo, temperaturaAr } = req.body;

    const dispositivo = await prisma.dispositivo.findUnique({ where: { deviceId } });
    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' });
    }

    const dado = await prisma.dadoSensor.create({
      data: {
        dispositivoId: dispositivo.id,
        umidadeSolo,
        luminosidade,
        temperaturaSolo,
        temperaturaAr,
      },
    });

    res.status(201).json(dado);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ erro: 'Erro ao salvar dados do sensor', detalhe: error.message });
    } else {
      res.status(500).json({ erro: 'Erro desconhecido ao salvar dados', detalhe: String(error) });
    }
  }
});

// Rota para consultar dados por data (app usa via GET)
router.get('/sensores/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const dispositivo = await prisma.dispositivo.findUnique({ where: { deviceId } });
    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' });
    }

    const inicio = new Date(dataInicio as string);
    const fim = new Date(dataFim as string);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return res.status(400).json({ erro: 'Datas inválidas' });
    }

    const dados = await prisma.dadoSensor.findMany({
      where: {
        dispositivoId: dispositivo.id,
        criadoEm: {
          gte: inicio,
          lte: fim,
        },
      },
      orderBy: { criadoEm: 'asc' },
    });

    res.json(dados);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ erro: 'Erro ao consultar dados', detalhe: error.message });
    } else {
      res.status(500).json({ erro: 'Erro desconhecido ao consultar dados', detalhe: String(error) });
    }
  }
});

// Rota para buscar os dados mais recentes dos sensores dos dispositivos do usuário autenticado
router.get('/sensores', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    // Busca dispositivos do usuário
    const dispositivos = await prisma.dispositivo.findMany({ where: { usuarioId: userId } });
    const dados = [];
    for (const disp of dispositivos) {
      const dado = await prisma.dadoSensor.findFirst({
        where: { dispositivoId: disp.id },
        orderBy: { criadoEm: 'desc' },
      });
      if (dado) {
        dados.push({
          nome: disp.nome,
          ...dado,
        });
      }
    }
    // Retorna os dados mais recentes de cada dispositivo
    res.json(dados.length > 0 ? dados[0] : {});
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados dos sensores', detalhe: String(error) });
  }
});

export default router;

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ✅ Rota corrigida: agora responde em /api/dispositivos
router.post('/', async (req, res) => {
  try {
    const { nome, deviceId, usuarioId } = req.body;

    const dispositivo = await prisma.dispositivo.create({
      data: {
        nome,
        deviceId,
        usuario: {
          connect: { id: usuarioId },
        },
      },
    });

    res.status(201).json(dispositivo);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        erro: 'Erro ao cadastrar dispositivo',
        detalhe: error.message,
      });
    } else {
      res.status(500).json({
        erro: 'Erro desconhecido',
        detalhe: String(error),
      });
    }
  }
});

export default router;

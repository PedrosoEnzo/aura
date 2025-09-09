import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        dispositivos: {
          include: {
            sensores: {
              orderBy: { criadoEm: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ erro: 'Erro ao buscar usuário', detalhe: error.message });
    } else {
      res.status(500).json({ erro: 'Erro desconhecido ao buscar usuário', detalhe: String(error) });
    }
  }
});

export default router;

// src/routes/perfil.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const router = Router()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'audne-secret'

router.get('/perfil', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ erro: 'Token não fornecido' })

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
      userId = decoded.id
    } catch (err) {
      return res.status(401).json({ erro: 'Token inválido' })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    })

    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' })

    res.json(usuario)
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    res.status(500).json({ erro: 'Erro interno do servidor' })
  }
})

export default router

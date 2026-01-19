import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getUserIdFromSession } from './auth.js'
import { LeaderboardQuerySchema } from '@creatr/shared'

export const leaderboardRoutes: FastifyPluginAsync = async (app) => {
    app.get('/', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)

        const result = LeaderboardQuerySchema.safeParse(request.query)
        const { range = '30d', limit = 20 } = result.success ? result.data : {}

        const entries = await prisma.leaderboardSnapshot.findMany({
            where: { period: range },
            orderBy: { rank: 'asc' },
            take: limit,
        })

        return reply.send({
            success: true,
            data: entries.map((entry: { rank: number; userId: string; username: string; displayName: string; avatarUrl: string | null; categories: string; earnings: number; conversions: number }) => ({
                rank: entry.rank,
                userId: entry.userId,
                username: entry.username,
                displayName: entry.displayName,
                avatarUrl: entry.avatarUrl,
                categories: JSON.parse(entry.categories || '[]'),
                earnings: entry.earnings,
                conversions: entry.conversions,
                isCurrentUser: userId === entry.userId,
            })),
        })
    })
}

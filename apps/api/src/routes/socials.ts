import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getUserIdFromSession } from './auth.js'
import { ConnectSocialSchema, DisconnectSocialSchema } from '@creatr/shared'

export const socialsRoutes: FastifyPluginAsync = async (app) => {
    // Get all social connections for current user
    app.get('/', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const connections = await prisma.socialConnection.findMany({
            where: { userId },
        })

        return reply.send({
            success: true,
            data: connections.map((c: { id: string; platform: string; status: string; handle: string | null; displayName: string | null; avatarUrl: string | null; followers: number | null; avgViews: number | null; accountAge: number | null; connectedAt: Date | null }) => ({
                id: c.id,
                platform: c.platform,
                status: c.status,
                handle: c.handle,
                displayName: c.displayName,
                avatarUrl: c.avatarUrl,
                followers: c.followers,
                avgViews: c.avgViews,
                accountAge: c.accountAge,
                connectedAt: c.connectedAt?.toISOString(),
            })),
        })
    })

    // Connect a social platform (simulated OAuth)
    app.post('/connect', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = ConnectSocialSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const { platform } = result.data

        // Simulate OAuth - generate mock data based on platform
        const mockData = generateMockSocialData(platform)

        const connection = await prisma.socialConnection.upsert({
            where: { userId_platform: { userId, platform } },
            update: {
                status: 'connected',
                handle: mockData.handle,
                displayName: mockData.displayName,
                avatarUrl: mockData.avatarUrl,
                followers: mockData.followers,
                avgViews: mockData.avgViews,
                accountAge: mockData.accountAge,
                connectedAt: new Date(),
                metadata: JSON.stringify(mockData.metadata),
            },
            create: {
                userId,
                platform,
                status: 'connected',
                handle: mockData.handle,
                displayName: mockData.displayName,
                avatarUrl: mockData.avatarUrl,
                followers: mockData.followers,
                avgViews: mockData.avgViews,
                accountAge: mockData.accountAge,
                connectedAt: new Date(),
                metadata: JSON.stringify(mockData.metadata),
            },
        })

        return reply.send({
            success: true,
            data: {
                id: connection.id,
                platform: connection.platform,
                status: connection.status,
                handle: connection.handle,
                displayName: connection.displayName,
                avatarUrl: connection.avatarUrl,
                followers: connection.followers,
                avgViews: connection.avgViews,
                accountAge: connection.accountAge,
                connectedAt: connection.connectedAt?.toISOString(),
            },
        })
    })

    // Disconnect a social platform
    app.post('/disconnect', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = DisconnectSocialSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const { platform } = result.data

        await prisma.socialConnection.updateMany({
            where: { userId, platform },
            data: { status: 'disconnected' },
        })

        return reply.send({ success: true })
    })
}

function generateMockSocialData(platform: string) {
    const baseFollowers = Math.floor(Math.random() * 50000) + 10000
    const displayNames: Record<string, string> = {
        youtube: 'Modern Mulan',
        tiktok: 'modernmulan',
        instagram: 'modern.mulan',
    }

    return {
        handle: `@${displayNames[platform] || 'modernmulan'}`,
        displayName: displayNames[platform] || 'Modern Mulan',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        followers: baseFollowers,
        avgViews: Math.floor(baseFollowers * (Math.random() * 0.3 + 0.1)),
        accountAge: Math.floor(Math.random() * 36) + 6, // 6-42 months
        metadata: {
            verificationStatus: 'verified',
            country: 'PH',
            primaryLanguage: 'en',
            contentCategory: 'Beauty',
        },
    }
}

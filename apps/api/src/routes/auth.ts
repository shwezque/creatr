import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { CreateSessionSchema } from '@creatr/shared'

// Simple in-memory session store for demo
const sessions = new Map<string, string>()

export const authRoutes: FastifyPluginAsync = async (app) => {
    // Create session (simple stub - simulates login)
    app.post('/session', async (request, reply) => {
        const result = CreateSessionSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const { email, name } = result.data

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            const username = email.split('@')[0]?.replace(/[^a-z0-9]/gi, '') || 'user'
            const uniqueUsername = `${username}${Date.now().toString(36)}`

            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0] || 'Creator',
                    username: uniqueUsername,
                },
            })
        }

        // Create session token
        const sessionToken = crypto.randomUUID()
        sessions.set(sessionToken, user.id)

        return reply.send({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                },
                token: sessionToken,
            },
        })
    })

    // Get current user from session
    app.get('/me', async (request, reply) => {
        const token = request.headers.authorization?.replace('Bearer ', '')
        if (!token || !sessions.has(token)) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const userId = sessions.get(token)
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'User not found' },
            })
        }

        return reply.send({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
        })
    })

    // Demo login (for easy testing - logs in as seed user)
    app.post('/demo', async (_request, reply) => {
        let user = await prisma.user.findFirst()

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'demo@creatr.app',
                    name: 'Demo Creator',
                    username: 'democreator',
                },
            })
        }

        const sessionToken = crypto.randomUUID()
        sessions.set(sessionToken, user.id)

        return reply.send({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                },
                token: sessionToken,
            },
        })
    })

    // Logout
    app.post('/logout', async (request, reply) => {
        const token = request.headers.authorization?.replace('Bearer ', '')
        if (token) {
            sessions.delete(token)
        }

        return reply.send({ success: true })
    })
}

// Helper to get user from session
export function getUserIdFromSession(token: string | undefined): string | null {
    if (!token) return null
    const cleanToken = token.replace('Bearer ', '')
    return sessions.get(cleanToken) ?? null
}

import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getUserIdFromSession } from './auth.js'
import { CoCreateApplySchema, COCREATE_REQUIREMENTS } from '@creatr/shared'

export const cocreateRoutes: FastifyPluginAsync = async (app) => {
    // Get eligibility status
    app.get('/eligibility', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        // Get user data for eligibility calculation
        const [connections, analysisSummary, salesCount] = await Promise.all([
            prisma.socialConnection.findMany({ where: { userId, status: 'connected' } }),
            prisma.analysisSummary.findUnique({ where: { userId } }),
            prisma.analyticsEvent.count({ where: { userId, eventType: 'conversion' } }),
        ])

        const totalFollowers = connections.reduce((sum: number, c: { followers: number | null }) => sum + (c.followers || 0), 0)
        const engagementScore = analysisSummary?.engagementScore || 0
        const consistencyScore = analysisSummary?.consistencyScore || 0

        const requirements = [
            {
                name: 'Followers',
                description: `Minimum ${COCREATE_REQUIREMENTS.minFollowers.toLocaleString()} combined followers`,
                current: totalFollowers,
                target: COCREATE_REQUIREMENTS.minFollowers,
                met: totalFollowers >= COCREATE_REQUIREMENTS.minFollowers,
            },
            {
                name: 'Engagement',
                description: `Engagement score of ${COCREATE_REQUIREMENTS.minEngagementScore}+`,
                current: engagementScore,
                target: COCREATE_REQUIREMENTS.minEngagementScore,
                met: engagementScore >= COCREATE_REQUIREMENTS.minEngagementScore,
            },
            {
                name: 'Consistency',
                description: `Consistency score of ${COCREATE_REQUIREMENTS.minConsistencyScore}+`,
                current: consistencyScore,
                target: COCREATE_REQUIREMENTS.minConsistencyScore,
                met: consistencyScore >= COCREATE_REQUIREMENTS.minConsistencyScore,
            },
            {
                name: 'Sales',
                description: `At least ${COCREATE_REQUIREMENTS.minSalesCount} product conversions`,
                current: salesCount,
                target: COCREATE_REQUIREMENTS.minSalesCount,
                met: salesCount >= COCREATE_REQUIREMENTS.minSalesCount,
            },
        ]

        const metCount = requirements.filter((r) => r.met).length
        const progress = Math.round((metCount / requirements.length) * 100)
        const isEligible = metCount === requirements.length

        return reply.send({
            success: true,
            data: { isEligible, progress, requirements },
        })
    })

    // Get brand briefs
    app.get('/briefs', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const [briefs, applications] = await Promise.all([
            prisma.brandBrief.findMany({ orderBy: { deadline: 'asc' } }),
            prisma.coCreateApplication.findMany({ where: { userId } }),
        ])

        const applicationsByBrief = new Map(applications.map((a: { briefId: string | null }) => [a.briefId, a]))

        return reply.send({
            success: true,
            data: briefs.map((brief: { id: string; brandName: string; brandLogoUrl: string | null; title: string; description: string; compensation: string; deadline: Date; categories: string; requirements: string }) => {
                const application = applicationsByBrief.get(brief.id)
                return {
                    id: brief.id,
                    brandName: brief.brandName,
                    brandLogoUrl: brief.brandLogoUrl,
                    title: brief.title,
                    description: brief.description,
                    compensation: brief.compensation,
                    deadline: brief.deadline.toISOString(),
                    categories: JSON.parse(brief.categories || '[]'),
                    requirements: JSON.parse(brief.requirements || '[]'),
                    status: application ? (application as unknown as { status: string }).status : 'available',
                }
            }),
        })
    })

    // Apply to co-create
    app.post('/apply', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = CoCreateApplySchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const { briefId, categories, message } = result.data

        const application = await prisma.coCreateApplication.create({
            data: {
                userId,
                briefId: briefId || null,
                categories: JSON.stringify(categories),
                message,
                status: 'applied',
            },
        })

        return reply.send({
            success: true,
            data: {
                id: application.id,
                status: application.status,
                createdAt: application.createdAt.toISOString(),
            },
        })
    })
}

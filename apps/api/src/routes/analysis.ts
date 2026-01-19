import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getUserIdFromSession } from './auth.js'

// In-memory analysis job status
const analysisJobs = new Map<string, { step: number; status: string; startedAt: Date }>()

const ANALYSIS_STEPS = ['fetching', 'analyzing', 'scoring', 'complete']

export const analysisRoutes: FastifyPluginAsync = async (app) => {
    // Start analysis
    app.post('/start', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        // Check for connected social accounts
        const connections = await prisma.socialConnection.findMany({
            where: { userId, status: 'connected' },
        })

        if (connections.length === 0) {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'INSUFFICIENT_CONNECTIONS',
                    message: 'Please connect at least one social account before analysis',
                },
            })
        }

        // Start the analysis job
        analysisJobs.set(userId, { step: 0, status: 'fetching', startedAt: new Date() })

        // Create or update analysis summary
        await prisma.analysisSummary.upsert({
            where: { userId },
            update: { status: 'fetching' },
            create: {
                userId,
                status: 'fetching',
                contentCategories: '[]',
                recommendedNiches: '[]',
            },
        })

        // Simulate async analysis progress
        simulateAnalysis(userId)

        return reply.send({
            success: true,
            data: { status: 'fetching', step: 1, totalSteps: 4 },
        })
    })

    // Get analysis status
    app.get('/status', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const job = analysisJobs.get(userId)
        const summary = await prisma.analysisSummary.findUnique({ where: { userId } })

        if (!job && !summary) {
            return reply.send({
                success: true,
                data: { status: 'idle', step: 0, totalSteps: 4 },
            })
        }

        const status = job?.status || summary?.status || 'idle'
        const step = job?.step ?? (status === 'complete' ? 4 : 0)

        return reply.send({
            success: true,
            data: {
                status,
                step: step + 1,
                totalSteps: 4,
                stepLabel: getStepLabel(step),
            },
        })
    })

    // Get analysis summary
    app.get('/summary', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const summary = await prisma.analysisSummary.findUnique({ where: { userId } })

        if (!summary || summary.status !== 'complete') {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Analysis not complete' },
            })
        }

        return reply.send({
            success: true,
            data: {
                id: summary.id,
                status: summary.status,
                contentCategories: JSON.parse(summary.contentCategories || '[]'),
                audienceRegion: summary.audienceRegion,
                audienceLanguage: summary.audienceLanguage,
                engagementScore: summary.engagementScore,
                consistencyScore: summary.consistencyScore,
                recommendedNiches: JSON.parse(summary.recommendedNiches || '[]'),
                completedAt: summary.completedAt?.toISOString(),
            },
        })
    })
}

function getStepLabel(step: number): string {
    const labels = [
        'Fetching posts from your social accounts...',
        'Analyzing content topics and themes...',
        'Computing audience signals and engagement...',
        'Generating brand fit recommendations...',
    ]
    return labels[step] || 'Processing...'
}

async function simulateAnalysis(userId: string) {
    // Simulate multi-step analysis
    for (let step = 0; step < ANALYSIS_STEPS.length; step++) {
        const status = ANALYSIS_STEPS[step]
        if (!status) continue

        await new Promise((resolve) => setTimeout(resolve, 1500))

        analysisJobs.set(userId, { step, status, startedAt: new Date() })

        await prisma.analysisSummary.update({
            where: { userId },
            data: { status },
        })
    }

    // Complete with mock data
    await prisma.analysisSummary.update({
        where: { userId },
        data: {
            status: 'complete',
            contentCategories: JSON.stringify([
                { name: 'Beauty', confidence: 92 },
                { name: 'Fashion', confidence: 78 },
                { name: 'Lifestyle', confidence: 65 },
            ]),
            audienceRegion: 'Southeast Asia',
            audienceLanguage: 'English, Filipino',
            engagementScore: 78,
            consistencyScore: 82,
            recommendedNiches: JSON.stringify([
                'Skincare & Makeup',
                'Fashion & Style',
                'Lifestyle Products',
                'Health & Wellness',
            ]),
            completedAt: new Date(),
        },
    })

    analysisJobs.delete(userId)
}

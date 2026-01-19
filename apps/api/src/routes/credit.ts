import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getUserIdFromSession } from './auth.js'
import { UpdateConsentSchema, LoanApplicationSchema, CREDIT_TIER_CONFIG } from '@creatr/shared'
import type { CreditTier } from '@creatr/shared'

export const creditRoutes: FastifyPluginAsync = async (app) => {
    // Get consent status
    app.get('/consent', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        let consent = await prisma.creditConsent.findUnique({ where: { userId } })

        if (!consent) {
            consent = await prisma.creditConsent.create({
                data: {
                    userId,
                    hasConsented: false,
                    dataExplanation: JSON.stringify([
                        'Connected social account metrics (followers, engagement)',
                        'Content analysis results (categories, consistency)',
                        'Affiliate performance (conversions, earnings history)',
                        'Account age and verification status',
                    ]),
                    notUsed: JSON.stringify([
                        'Your personal messages or DMs',
                        'Your browsing history',
                        'Your location data',
                        'Any data from non-connected platforms',
                    ]),
                },
            })
        }

        return reply.send({
            success: true,
            data: {
                userId: consent.userId,
                hasConsented: consent.hasConsented,
                consentedAt: consent.consentedAt?.toISOString(),
                revokedAt: consent.revokedAt?.toISOString(),
                dataExplanation: JSON.parse(consent.dataExplanation || '[]'),
                notUsed: JSON.parse(consent.notUsed || '[]'),
            },
        })
    })

    // Update consent
    app.post('/consent', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = UpdateConsentSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const { consent } = result.data

        await prisma.creditConsent.upsert({
            where: { userId },
            update: {
                hasConsented: consent,
                consentedAt: consent ? new Date() : undefined,
                revokedAt: consent ? null : new Date(),
            },
            create: {
                userId,
                hasConsented: consent,
                consentedAt: consent ? new Date() : null,
                dataExplanation: JSON.stringify([
                    'Connected social account metrics',
                    'Content analysis results',
                    'Affiliate performance',
                    'Account age and verification status',
                ]),
                notUsed: JSON.stringify([
                    'Your personal messages',
                    'Your browsing history',
                    'Your location data',
                ]),
            },
        })

        return reply.send({ success: true })
    })

    // Calculate credit score
    app.post('/score', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        // Check consent
        const consent = await prisma.creditConsent.findUnique({ where: { userId } })
        if (!consent?.hasConsented) {
            return reply.status(403).send({
                success: false,
                error: { code: 'CONSENT_REQUIRED', message: 'Please provide consent first' },
            })
        }

        // Calculate score based on various factors
        const [connections, analysis, conversions, creatorProducts] = await Promise.all([
            prisma.socialConnection.findMany({ where: { userId, status: 'connected' } }),
            prisma.analysisSummary.findUnique({ where: { userId } }),
            prisma.analyticsEvent.count({ where: { userId, eventType: 'conversion' } }),
            prisma.creatorProduct.count({ where: { userId } }),
        ])

        const factors = []
        let totalScore = 0

        // Platform connections (max 200 points)
        const connectionScore = Math.min(connections.length * 70, 200)
        factors.push({
            name: 'Platform Connections',
            description: `${connections.length} verified platform(s) connected`,
            impact: connectionScore > 100 ? 'positive' : connections.length > 0 ? 'neutral' : 'negative',
            score: connectionScore,
            maxScore: 200,
        })
        totalScore += connectionScore

        // Followers (max 200 points)
        const totalFollowers = connections.reduce((sum: number, c: { followers: number | null }) => sum + (c.followers || 0), 0)
        const followerScore = Math.min(Math.floor(totalFollowers / 500), 200)
        factors.push({
            name: 'Audience Size',
            description: `${totalFollowers.toLocaleString()} total followers`,
            impact: followerScore > 100 ? 'positive' : followerScore > 50 ? 'neutral' : 'negative',
            score: followerScore,
            maxScore: 200,
        })
        totalScore += followerScore

        // Engagement score (max 200 points)
        const engagementScore = (analysis?.engagementScore || 0) * 2
        factors.push({
            name: 'Engagement Quality',
            description: `${analysis?.engagementScore || 0}% engagement score`,
            impact: engagementScore > 100 ? 'positive' : engagementScore > 50 ? 'neutral' : 'negative',
            score: engagementScore,
            maxScore: 200,
        })
        totalScore += engagementScore

        // Consistency score (max 200 points)
        const consistencyScore = (analysis?.consistencyScore || 0) * 2
        factors.push({
            name: 'Content Consistency',
            description: `${analysis?.consistencyScore || 0}% consistency`,
            impact: consistencyScore > 100 ? 'positive' : consistencyScore > 50 ? 'neutral' : 'negative',
            score: consistencyScore,
            maxScore: 200,
        })
        totalScore += consistencyScore

        // Affiliate performance (max 200 points)
        const performanceScore = Math.min(conversions * 20 + creatorProducts * 10, 200)
        factors.push({
            name: 'Affiliate Performance',
            description: `${conversions} conversions, ${creatorProducts} products`,
            impact: performanceScore > 100 ? 'positive' : performanceScore > 30 ? 'neutral' : 'negative',
            score: performanceScore,
            maxScore: 200,
        })
        totalScore += performanceScore

        // Determine tier
        let tier: CreditTier = 'D'
        if (totalScore >= CREDIT_TIER_CONFIG.A.minScore) tier = 'A'
        else if (totalScore >= CREDIT_TIER_CONFIG.B.minScore) tier = 'B'
        else if (totalScore >= CREDIT_TIER_CONFIG.C.minScore) tier = 'C'

        const tierConfig = CREDIT_TIER_CONFIG[tier]

        // Save assessment
        const assessment = await prisma.creditAssessment.upsert({
            where: { userId },
            update: {
                tier,
                score: totalScore,
                maxLoanAmount: tierConfig.maxLoanAmount,
                aprMin: tierConfig.aprRange.min,
                aprMax: tierConfig.aprRange.max,
                termOptions: JSON.stringify([3, 6, 12, 24]),
                factors: JSON.stringify(factors),
                calculatedAt: new Date(),
            },
            create: {
                userId,
                tier,
                score: totalScore,
                maxLoanAmount: tierConfig.maxLoanAmount,
                aprMin: tierConfig.aprRange.min,
                aprMax: tierConfig.aprRange.max,
                termOptions: JSON.stringify([3, 6, 12, 24]),
                factors: JSON.stringify(factors),
            },
        })

        return reply.send({
            success: true,
            data: {
                userId: assessment.userId,
                tier: assessment.tier,
                score: assessment.score,
                maxLoanAmount: assessment.maxLoanAmount,
                aprRange: { min: assessment.aprMin, max: assessment.aprMax },
                termOptions: JSON.parse(assessment.termOptions || '[]'),
                factors,
                calculatedAt: assessment.calculatedAt.toISOString(),
            },
        })
    })

    // Get loan offers
    app.get('/loans/offers', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        // Check consent and assessment
        const [consent, assessment] = await Promise.all([
            prisma.creditConsent.findUnique({ where: { userId } }),
            prisma.creditAssessment.findUnique({ where: { userId } }),
        ])

        if (!consent?.hasConsented) {
            return reply.status(403).send({
                success: false,
                error: { code: 'CONSENT_REQUIRED', message: 'Please provide consent first' },
            })
        }

        if (!assessment) {
            return reply.status(400).send({
                success: false,
                error: { code: 'SCORE_REQUIRED', message: 'Please calculate your credit score first' },
            })
        }

        // Get base loan offers and customize based on tier
        const baseOffers = await prisma.loanOffer.findMany()

        const offers = baseOffers.map((offer: { id: string; partnerId: string | null; partnerName: string; partnerLogoUrl: string; maxAmount: number; apr: number; termMonths: number; requirements: string | null }) => {
            const maxAmount = Math.min(offer.maxAmount, assessment.maxLoanAmount)
            const apr = Math.max(offer.apr, assessment.aprMin)
            const termMonths = offer.termMonths
            const monthlyPayment = calculateMonthlyPayment(maxAmount, apr, termMonths)

            return {
                id: offer.id,
                partnerId: offer.partnerId,
                partnerName: offer.partnerName,
                partnerLogoUrl: offer.partnerLogoUrl,
                amount: maxAmount,
                apr,
                termMonths,
                monthlyPayment: Math.round(monthlyPayment * 100) / 100,
                totalRepayment: Math.round(monthlyPayment * termMonths * 100) / 100,
                requirements: JSON.parse(offer.requirements || '[]'),
            }
        })

        return reply.send({
            success: true,
            data: { assessment: { tier: assessment.tier, score: assessment.score }, offers },
        })
    })

    // Apply for loan
    app.post('/loans/apply', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = LoanApplicationSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const input = result.data

        // Get offer and assessment
        const [offer, assessment] = await Promise.all([
            prisma.loanOffer.findUnique({ where: { id: input.offerId } }),
            prisma.creditAssessment.findUnique({ where: { userId } }),
        ])

        if (!offer) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Offer not found' },
            })
        }

        if (!assessment) {
            return reply.status(400).send({
                success: false,
                error: { code: 'SCORE_REQUIRED', message: 'Credit assessment required' },
            })
        }

        // Determine approval (simplified logic)
        const maxAllowed = Math.min(offer.maxAmount, assessment.maxLoanAmount)
        const isApproved = input.amount <= maxAllowed && input.kycCompleted

        // Generate repayment schedule if approved
        let repaymentSchedule: { dueDate: string; amount: number; status: string }[] = []
        if (isApproved) {
            const monthlyPayment = calculateMonthlyPayment(input.amount, offer.apr, offer.termMonths)
            repaymentSchedule = Array.from({ length: offer.termMonths }, (_, i) => ({
                dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                amount: Math.round(monthlyPayment * 100) / 100,
                status: 'upcoming',
            }))
        }

        const application = await prisma.loanApplication.create({
            data: {
                userId,
                offerId: input.offerId,
                amount: input.amount,
                purpose: input.purpose,
                status: isApproved ? 'approved' : 'rejected',
                legalName: input.legalName,
                email: input.email,
                phone: input.phone,
                country: input.country,
                payoutAccount: input.payoutAccount,
                kycCompleted: input.kycCompleted,
                approvedAt: isApproved ? new Date() : null,
                rejectedReason: isApproved ? null : 'Amount exceeds eligible limit or KYC incomplete',
                repaymentSchedule: isApproved ? JSON.stringify(repaymentSchedule) : null,
            },
        })

        return reply.send({
            success: true,
            data: {
                id: application.id,
                status: application.status,
                approvedAt: application.approvedAt?.toISOString(),
                rejectedReason: application.rejectedReason,
            },
        })
    })

    // Get loan status
    app.get('/loans/status', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const applications = await prisma.loanApplication.findMany({
            where: { userId },
            include: { offer: true },
            orderBy: { createdAt: 'desc' },
        })

        return reply.send({
            success: true,
            data: applications.map((app: { id: string; offer: { partnerName: string; partnerLogoUrl: string }; amount: number; purpose: string; status: string; createdAt: Date; approvedAt: Date | null; rejectedReason: string | null; repaymentSchedule: string | null }) => ({
                id: app.id,
                offer: {
                    partnerName: app.offer.partnerName,
                    partnerLogoUrl: app.offer.partnerLogoUrl,
                },
                amount: app.amount,
                purpose: app.purpose,
                status: app.status,
                createdAt: app.createdAt.toISOString(),
                approvedAt: app.approvedAt?.toISOString(),
                rejectedReason: app.rejectedReason,
                repaymentSchedule: app.repaymentSchedule ? JSON.parse(app.repaymentSchedule) : null,
            })),
        })
    })

    // Get improvement tips
    app.get('/tips', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const [connections, creatorProducts, conversions] = await Promise.all([
            prisma.socialConnection.count({ where: { userId, status: 'connected' } }),
            prisma.creatorProduct.count({ where: { userId } }),
            prisma.analyticsEvent.count({ where: { userId, eventType: 'conversion' } }),
        ])

        const tips = []

        if (connections < 3) {
            tips.push({
                id: 'connect-more',
                title: 'Connect More Platforms',
                description: 'Connecting all your social accounts increases your credit score significantly.',
                impact: 'high',
                action: 'Connect now',
                actionRoute: '/app/connect',
            })
        }

        if (creatorProducts < 5) {
            tips.push({
                id: 'add-products',
                title: 'Add More Products',
                description: 'Having more products in your shop shows affiliate commitment.',
                impact: 'medium',
                action: 'Browse products',
                actionRoute: '/app/recommendations',
            })
        }

        if (conversions < 10) {
            tips.push({
                id: 'drive-conversions',
                title: 'Drive More Conversions',
                description: 'Share your shoplinks to generate sales and boost your credit score.',
                impact: 'high',
                action: 'View shoplinks',
                actionRoute: '/app/shoplinks',
            })
        }

        return reply.send({ success: true, data: tips })
    })
}

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12
    if (monthlyRate === 0) return principal / months
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

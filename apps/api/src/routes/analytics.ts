import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getUserIdFromSession } from './auth.js'
import { SimulateEventsSchema } from '@creatr/shared'

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
    // Get analytics summary
    app.get('/summary', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const events = await prisma.analyticsEvent.findMany({
            where: { userId },
        })

        const clicks = events.filter((e: { eventType: string }) => e.eventType === 'click').length
        const conversions = events.filter((e: { eventType: string }) => e.eventType === 'conversion').length
        const revenue = events.reduce((sum: number, e: { revenue: number }) => sum + e.revenue, 0)
        const commission = events.reduce((sum: number, e: { commission: number }) => sum + e.commission, 0)

        const ctr = clicks > 0 ? (conversions / clicks) * 100 : 0
        const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0

        // Calculate trends (mock - random between -20 and +30)
        const clicksTrend = Math.random() * 50 - 20
        const conversionsTrend = Math.random() * 50 - 20
        const revenueTrend = Math.random() * 50 - 20

        return reply.send({
            success: true,
            data: {
                totalClicks: clicks,
                totalConversions: conversions,
                totalRevenue: Math.round(revenue * 100) / 100,
                totalCommission: Math.round(commission * 100) / 100,
                ctr: Math.round(ctr * 100) / 100,
                cvr: Math.round(cvr * 100) / 100,
                clicksTrend: Math.round(clicksTrend * 100) / 100,
                conversionsTrend: Math.round(conversionsTrend * 100) / 100,
                revenueTrend: Math.round(revenueTrend * 100) / 100,
            },
        })
    })

    // Get per-product analytics
    app.get('/products', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const events = await prisma.analyticsEvent.findMany({
            where: { userId },
            include: { product: true },
        })

        // Group by product
        const productStats = new Map<
            string,
            { product: typeof events[0]['product']; clicks: number; conversions: number; revenue: number; commission: number }
        >()

        for (const event of events) {
            const existing = productStats.get(event.productId) || {
                product: event.product,
                clicks: 0,
                conversions: 0,
                revenue: 0,
                commission: 0,
            }

            if (event.eventType === 'click') existing.clicks++
            if (event.eventType === 'conversion') {
                existing.conversions++
                existing.revenue += event.revenue
                existing.commission += event.commission
            }

            productStats.set(event.productId, existing)
        }

        const productAnalytics = Array.from(productStats.values()).map((stats) => ({
            productId: stats.product.id,
            product: {
                id: stats.product.id,
                name: stats.product.name,
                brand: stats.product.brand,
                imageUrl: stats.product.imageUrl,
            },
            clicks: stats.clicks,
            conversions: stats.conversions,
            revenue: Math.round(stats.revenue * 100) / 100,
            commission: Math.round(stats.commission * 100) / 100,
            ctr: stats.clicks > 0 ? Math.round((stats.conversions / stats.clicks) * 10000) / 100 : 0,
            cvr: stats.clicks > 0 ? Math.round((stats.conversions / stats.clicks) * 10000) / 100 : 0,
            trend: Math.round((Math.random() * 50 - 20) * 100) / 100,
        }))

        return reply.send({
            success: true,
            data: productAnalytics,
        })
    })

    // Simulate events (dev only)
    app.post('/simulate', async (request, reply) => {
        if (process.env.NODE_ENV === 'production') {
            return reply.status(403).send({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Not available in production' },
            })
        }

        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = SimulateEventsSchema.safeParse(request.body)
        const input = result.success ? result.data : {}

        // Get user's products
        const creatorProducts = await prisma.creatorProduct.findMany({
            where: { userId },
            include: { product: true },
        })

        if (creatorProducts.length === 0) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'No products in your shop' },
            })
        }

        const clicks = input.clicks || Math.floor(Math.random() * 20) + 5
        const conversions = input.conversions || Math.floor(clicks * (Math.random() * 0.3))

        const eventsToCreate = []

        for (let i = 0; i < clicks; i++) {
            const randomProduct = creatorProducts[Math.floor(Math.random() * creatorProducts.length)]
            if (!randomProduct) continue

            eventsToCreate.push({
                userId,
                productId: randomProduct.productId,
                eventType: 'click',
                revenue: 0,
                commission: 0,
            })

            if (i < conversions) {
                eventsToCreate.push({
                    userId,
                    productId: randomProduct.productId,
                    eventType: 'conversion',
                    revenue: randomProduct.product.price,
                    commission: randomProduct.product.price * (randomProduct.product.commission / 100),
                })
            }
        }

        await prisma.analyticsEvent.createMany({ data: eventsToCreate })

        return reply.send({
            success: true,
            data: { clicks, conversions, eventsCreated: eventsToCreate.length },
        })
    })
}

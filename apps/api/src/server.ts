import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth.js'
import { socialsRoutes } from './routes/socials.js'
import { analysisRoutes } from './routes/analysis.js'
import { productsRoutes } from './routes/products.js'
import { analyticsRoutes } from './routes/analytics.js'
import { leaderboardRoutes } from './routes/leaderboard.js'
import { cocreateRoutes } from './routes/cocreate.js'
import { creditRoutes } from './routes/credit.js'

const app = Fastify({
    logger: true,
    genReqId: () => crypto.randomUUID(),
})

// Register CORS
await app.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
})

// Add request ID to response headers
app.addHook('onSend', async (request, reply) => {
    reply.header('X-Request-ID', request.id)
})

// Global error handler
app.setErrorHandler((error, request, reply) => {
    request.log.error(error)

    const statusCode = error.statusCode ?? 500
    const response = {
        success: false,
        error: {
            code: error.code ?? 'INTERNAL_ERROR',
            message: error.message ?? 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
        },
        requestId: request.id,
    }

    reply.status(statusCode).send(response)
})

// Health check
app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
}))

// Register routes
app.register(authRoutes, { prefix: '/auth' })
app.register(socialsRoutes, { prefix: '/socials' })
app.register(analysisRoutes, { prefix: '/analysis' })
app.register(productsRoutes, { prefix: '/products' })
app.register(analyticsRoutes, { prefix: '/analytics' })
app.register(leaderboardRoutes, { prefix: '/leaderboard' })
app.register(cocreateRoutes, { prefix: '/cocreate' })
app.register(creditRoutes, { prefix: '/credit' })

// Start server
const port = Number(process.env.PORT) || 3001
const host = '0.0.0.0'

try {
    await app.listen({ port, host })
    console.log(`🚀 API server running at http://localhost:${port}`)
} catch (err) {
    app.log.error(err)
    process.exit(1)
}

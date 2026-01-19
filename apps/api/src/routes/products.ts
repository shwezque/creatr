import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { getUserIdFromSession } from './auth.js'
import { ProductFilterSchema, AddCreatorProductSchema, GenerateShoplinkSchema } from '@creatr/shared'

export const productsRoutes: FastifyPluginAsync = async (app) => {
    // List all products with filters
    app.get('/', async (request, reply) => {
        const result = ProductFilterSchema.safeParse(request.query)
        const filters = result.success ? result.data : {}

        const where: Record<string, unknown> = {}

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { brand: { contains: filters.search } },
                { category: { contains: filters.search } },
            ]
        }
        if (filters.category) {
            where.category = filters.category
        }
        if (filters.minPrice !== undefined) {
            where.price = { ...((where.price as object) || {}), gte: filters.minPrice }
        }
        if (filters.maxPrice !== undefined) {
            where.price = { ...((where.price as object) || {}), lte: filters.maxPrice }
        }
        if (filters.minRating !== undefined) {
            where.rating = { gte: filters.minRating }
        }
        if (filters.minCommission !== undefined) {
            where.commission = { gte: filters.minCommission }
        }

        const page = filters.page || 1
        const pageSize = filters.pageSize || 20
        const skip = (page - 1) * pageSize

        const orderBy: Record<string, string> = {}
        switch (filters.sortBy) {
            case 'commission':
                orderBy.commission = filters.sortOrder || 'desc'
                break
            case 'rating':
                orderBy.rating = filters.sortOrder || 'desc'
                break
            case 'price':
                orderBy.price = filters.sortOrder || 'asc'
                break
            case 'newest':
                orderBy.createdAt = 'desc'
                break
            default:
                orderBy.rating = 'desc'
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ])

        return reply.send({
            success: true,
            data: {
                items: products.map(formatProduct),
                total,
                page,
                pageSize,
                hasMore: skip + products.length < total,
            },
        })
    })

    // Get single product
    app.get('/:id', async (request, reply) => {
        const { id } = request.params as { id: string }

        const product = await prisma.product.findUnique({ where: { id } })
        if (!product) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Product not found' },
            })
        }

        // Get similar products
        const similar = await prisma.product.findMany({
            where: {
                category: product.category,
                id: { not: product.id },
            },
            take: 4,
        })

        return reply.send({
            success: true,
            data: {
                ...formatProduct(product),
                similarProducts: similar.map(formatProduct),
            },
        })
    })

    // Get creator's selected products
    app.get('/creator/products', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const creatorProducts = await prisma.creatorProduct.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { addedAt: 'desc' },
        })

        return reply.send({
            success: true,
            data: creatorProducts.map((cp: { id: string; productId: string; product: Parameters<typeof formatProduct>[0]; addedAt: Date; shoplink: string | null; shoplinkCreatedAt: Date | null }) => ({
                id: cp.id,
                productId: cp.productId,
                product: formatProduct(cp.product),
                addedAt: cp.addedAt.toISOString(),
                shoplink: cp.shoplink,
                shoplinkCreatedAt: cp.shoplinkCreatedAt?.toISOString(),
            })),
        })
    })

    // Add product to creator's shop
    app.post('/creator/products', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = AddCreatorProductSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const { productId } = result.data

        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Product not found' },
            })
        }

        const creatorProduct = await prisma.creatorProduct.upsert({
            where: { userId_productId: { userId, productId } },
            update: {},
            create: { userId, productId },
            include: { product: true },
        })

        return reply.send({
            success: true,
            data: {
                id: creatorProduct.id,
                productId: creatorProduct.productId,
                product: formatProduct(creatorProduct.product),
                addedAt: creatorProduct.addedAt.toISOString(),
            },
        })
    })

    // Remove product from creator's shop
    app.delete('/creator/products/:productId', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const { productId } = request.params as { productId: string }

        await prisma.creatorProduct.deleteMany({
            where: { userId, productId },
        })

        return reply.send({ success: true })
    })

    // Generate shoplink
    app.post('/shoplinks/generate', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const result = GenerateShoplinkSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: result.error.message },
            })
        }

        const { productId, utmSource, utmMedium, utmCampaign } = result.data

        const creatorProduct = await prisma.creatorProduct.findUnique({
            where: { userId_productId: { userId, productId } },
        })

        if (!creatorProduct) {
            return reply.status(400).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Product not in your shop' },
            })
        }

        // Get user for username
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'User not found' },
            })
        }

        // Generate deterministic shoplink
        const utmParams = new URLSearchParams()
        if (utmSource) utmParams.set('utm_source', utmSource)
        if (utmMedium) utmParams.set('utm_medium', utmMedium)
        if (utmCampaign) utmParams.set('utm_campaign', utmCampaign)
        utmParams.set('ref', user.username)

        const shoplink = `https://shop.creatr.app/p/${productId}?${utmParams.toString()}`

        await prisma.creatorProduct.update({
            where: { id: creatorProduct.id },
            data: { shoplink, shoplinkCreatedAt: new Date() },
        })

        return reply.send({
            success: true,
            data: { shoplink },
        })
    })

    // Get all shoplinks
    app.get('/shoplinks', async (request, reply) => {
        const userId = getUserIdFromSession(request.headers.authorization)
        if (!userId) {
            return reply.status(401).send({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
            })
        }

        const creatorProducts = await prisma.creatorProduct.findMany({
            where: { userId, shoplink: { not: null } },
            include: { product: true },
            orderBy: { shoplinkCreatedAt: 'desc' },
        })

        return reply.send({
            success: true,
            data: creatorProducts.map((cp: { id: string; productId: string; product: Parameters<typeof formatProduct>[0]; shoplink: string | null; shoplinkCreatedAt: Date | null }) => ({
                id: cp.id,
                productId: cp.productId,
                product: formatProduct(cp.product),
                shoplink: cp.shoplink,
                createdAt: cp.shoplinkCreatedAt?.toISOString(),
            })),
        })
    })
}

function formatProduct(product: {
    id: string
    name: string
    brand: string
    brandLogoUrl: string | null
    imageUrl: string
    images: string
    price: number
    srp: number
    commission: number
    rating: number
    soldCount: number
    category: string
    subcategory: string | null
    description: string
    benefits: string
    contentHooks: string
    isVerified: boolean
}) {
    return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        brandLogoUrl: product.brandLogoUrl,
        imageUrl: product.imageUrl,
        images: JSON.parse(product.images || '[]'),
        price: product.price,
        srp: product.srp,
        commission: product.commission,
        commissionAmount: Math.round(product.price * (product.commission / 100) * 100) / 100,
        rating: product.rating,
        soldCount: product.soldCount,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        benefits: JSON.parse(product.benefits || '[]'),
        contentHooks: JSON.parse(product.contentHooks || '[]'),
        isVerified: product.isVerified,
    }
}

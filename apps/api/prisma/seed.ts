import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clear existing data
    await prisma.analyticsEvent.deleteMany()
    await prisma.loanApplication.deleteMany()
    await prisma.loanOffer.deleteMany()
    await prisma.creditAssessment.deleteMany()
    await prisma.creditConsent.deleteMany()
    await prisma.coCreateApplication.deleteMany()
    await prisma.brandBrief.deleteMany()
    await prisma.leaderboardSnapshot.deleteMany()
    await prisma.creatorProduct.deleteMany()
    await prisma.analysisSummary.deleteMany()
    await prisma.socialConnection.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()

    // Create test user
    const user = await prisma.user.create({
        data: {
            email: 'creator@creatr.app',
            name: 'Modern Mulan',
            username: 'modernmulan',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        },
    })
    console.log('✅ Created user:', user.username)

    // Create products
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Lip Glaze [Peptide Lip Treatment]',
                brand: 'Sunnies Face',
                brandLogoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop',
                imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
                ]),
                price: 445,
                srp: 299,
                commission: 5,
                rating: 4.7,
                soldCount: 160,
                category: 'Beauty',
                subcategory: 'Lips',
                description: 'A nourishing, peptide lip treatment in a glossy finish with a cooling metal applicator.',
                benefits: JSON.stringify([
                    'Hydrating formula',
                    'Peptide-infused',
                    'Cooling applicator',
                    'High-shine finish',
                ]),
                contentHooks: JSON.stringify([
                    'Perfect GRWM lip moment',
                    'The lip staple everyone needs',
                    'Glass lips in one swipe',
                ]),
                isVerified: true,
            },
        }),
        prisma.product.create({
            data: {
                name: 'First Base Everyday Skin Tint',
                brand: 'Colourette',
                brandLogoUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
                imageUrl: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&h=400&fit=crop',
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&h=400&fit=crop',
                ]),
                price: 199,
                srp: 299,
                commission: 8,
                rating: 4.7,
                soldCount: 160,
                category: 'Beauty',
                subcategory: 'Face',
                description: 'Lightweight everyday skin tint with buildable coverage for a natural, dewy finish.',
                benefits: JSON.stringify([
                    'Buildable coverage',
                    'Dewy finish',
                    'All-day wear',
                    'Skincare benefits',
                ]),
                contentHooks: JSON.stringify([
                    'My everyday base routine',
                    'No-makeup makeup look',
                    'Perfect for IG stories',
                ]),
                isVerified: true,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Velvet Matte Lip Tint Set',
                brand: 'O.TWO.O',
                brandLogoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop',
                imageUrl: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=400&fit=crop',
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=400&fit=crop',
                ]),
                price: 445,
                srp: 299,
                commission: 6,
                rating: 4.5,
                soldCount: 89,
                category: 'Beauty',
                subcategory: 'Lips',
                description: 'Long-lasting velvet matte lip tint with intense color payoff.',
                benefits: JSON.stringify(['Matte finish', 'Long-lasting', 'Pigmented', 'Non-drying']),
                contentHooks: JSON.stringify([
                    'Best dupes for high-end lips',
                    'Swatches for days',
                    'Wear test challenge',
                ]),
                isVerified: true,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Airy Matte Perfecting Foundation SPF 20',
                brand: 'blk Cosmetics',
                brandLogoUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
                imageUrl: 'https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=400&h=400&fit=crop',
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=400&h=400&fit=crop',
                ]),
                price: 399,
                srp: 499,
                commission: 7,
                rating: 4.6,
                soldCount: 210,
                category: 'Beauty',
                subcategory: 'Face',
                description: 'Weightless foundation with SPF protection for all-day flawless coverage.',
                benefits: JSON.stringify(['SPF 20', 'Airy matte finish', 'Blurs pores', 'Oil control']),
                contentHooks: JSON.stringify([
                    '12-hour wear test',
                    'Foundation routine for oily skin',
                    'Before and after transformation',
                ]),
                isVerified: true,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Wireless Bluetooth Earbuds Pro',
                brand: 'TechFlow',
                imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
                ]),
                price: 2499,
                srp: 3499,
                commission: 10,
                rating: 4.8,
                soldCount: 450,
                category: 'Tech',
                subcategory: 'Audio',
                description: 'Premium wireless earbuds with active noise cancellation and 24-hour battery life.',
                benefits: JSON.stringify([
                    'Active noise cancellation',
                    '24hr battery',
                    'IPX5 water resistant',
                    'Touch controls',
                ]),
                contentHooks: JSON.stringify([
                    'Perfect for content creators',
                    'My daily tech essentials',
                    'Best budget ANC earbuds',
                ]),
                isVerified: true,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Protein Power Shake Mix',
                brand: 'FitLife',
                imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop',
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop',
                ]),
                price: 1299,
                srp: 1599,
                commission: 12,
                rating: 4.4,
                soldCount: 320,
                category: 'Health',
                subcategory: 'Supplements',
                description: 'Premium whey protein blend with 25g protein per serving for muscle recovery.',
                benefits: JSON.stringify([
                    '25g protein per serving',
                    'Low sugar',
                    'Fast absorption',
                    'Great taste',
                ]),
                contentHooks: JSON.stringify([
                    'Post-workout routine',
                    'Fitness journey update',
                    'Protein shake recipe ideas',
                ]),
                isVerified: false,
            },
        }),
    ])
    console.log('✅ Created', products.length, 'products')

    // Create loan offers
    const loanOffers = await Promise.all([
        prisma.loanOffer.create({
            data: {
                partnerId: 'partner-1',
                partnerName: 'CreatorBank',
                partnerLogoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
                minAmount: 10000,
                maxAmount: 500000,
                apr: 12,
                termMonths: 12,
                requirements: JSON.stringify([
                    'Valid government ID',
                    'Connected social accounts',
                    'Active for 6+ months',
                ]),
            },
        }),
        prisma.loanOffer.create({
            data: {
                partnerId: 'partner-2',
                partnerName: 'InfluencerFund',
                partnerLogoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop',
                minAmount: 5000,
                maxAmount: 250000,
                apr: 15,
                termMonths: 6,
                requirements: JSON.stringify([
                    'Valid government ID',
                    'Minimum 5,000 followers',
                    'Bank account verification',
                ]),
            },
        }),
    ])
    console.log('✅ Created', loanOffers.length, 'loan offers')

    // Create brand briefs
    const brandBriefs = await Promise.all([
        prisma.brandBrief.create({
            data: {
                brandName: 'Jollibee',
                brandLogoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
                title: 'New Chicken Joy Campaign',
                description: 'Create engaging content featuring our best-selling Chickenjoy. Looking for authentic food content creators.',
                compensation: '₱15,000 - ₱50,000',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                categories: JSON.stringify(['Food', 'Lifestyle']),
                requirements: JSON.stringify([
                    '10,000+ followers',
                    'Food content focus',
                    '3+ posts per month',
                ]),
            },
        }),
        prisma.brandBrief.create({
            data: {
                brandName: 'Samsung',
                brandLogoUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&h=100&fit=crop',
                title: 'Galaxy Z Fold Creators Program',
                description: 'Showcase creative ways to use the Galaxy Z Fold. Tech and lifestyle creators welcome.',
                compensation: '₱30,000 - ₱100,000 + device',
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                categories: JSON.stringify(['Tech', 'Lifestyle']),
                requirements: JSON.stringify([
                    '50,000+ followers',
                    'Tech content experience',
                    'High engagement rate',
                ]),
            },
        }),
        prisma.brandBrief.create({
            data: {
                brandName: 'Sunnies Face',
                brandLogoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop',
                title: 'Fluffmatte Collection Launch',
                description: 'Be part of our new Fluffmatte collection launch. Looking for beauty creators with authentic voices.',
                compensation: '₱10,000 - ₱25,000 + products',
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                categories: JSON.stringify(['Beauty', 'Fashion']),
                requirements: JSON.stringify([
                    '5,000+ followers',
                    'Beauty content focus',
                    'Previous makeup tutorials',
                ]),
            },
        }),
    ])
    console.log('✅ Created', brandBriefs.length, 'brand briefs')

    // Create leaderboard entries
    const leaderboardUsers = [
        { username: 'jomaryee', displayName: 'Jomar Yee', categories: ['Lifestyle', 'Clothes', 'Travel'], earnings: 125000 },
        { username: 'connhcruz', displayName: 'Connh Cruz', categories: ['Food', 'Mom', 'Appliances'], earnings: 98000 },
        { username: 'malupiton', displayName: 'Malupiton', categories: ['Lifestyle', 'Clothes', 'Travel'], earnings: 87500 },
        { username: 'reigermar', displayName: 'Rei Germar', categories: ['Beauty', 'Clothes', 'Travel'], earnings: 76000 },
        { username: 'abimarquez', displayName: 'Abi Marquez', categories: ['Food', 'Appliances'], earnings: 65000 },
        { username: 'ninongry', displayName: 'Ninong Ry', categories: ['Food', 'Appliances'], earnings: 54000 },
        { username: 'congtv', displayName: 'Cong TV', categories: ['Lifestyle', 'Food', 'Appliances'], earnings: 48000 },
        { username: 'viycortez', displayName: 'Viy Cortez-Velasquez', categories: ['Lifestyle', 'Food', 'Appliances'], earnings: 42000 },
        { username: 'joshuagarcia', displayName: 'Joshua Garcia', categories: ['Beauty', 'Food', 'Travel'], earnings: 38000 },
        { username: 'andreabrillantes', displayName: 'Andrea Brillantes', categories: ['Beauty', 'Food', 'Travel'], earnings: 35000 },
        { username: 'modernmulan', displayName: 'Modern Mulan', categories: ['Beauty', 'Fashion', 'Lifestyle'], earnings: 32000 },
    ]

    for (const period of ['7d', '30d', 'all']) {
        const multiplier = period === '7d' ? 0.25 : period === '30d' ? 0.7 : 1
        for (let i = 0; i < leaderboardUsers.length; i++) {
            const entry = leaderboardUsers[i]
            if (!entry) continue
            await prisma.leaderboardSnapshot.create({
                data: {
                    userId: entry.username === 'modernmulan' ? user.id : `user-${entry.username}`,
                    username: entry.username,
                    displayName: entry.displayName,
                    avatarUrl: `https://i.pravatar.cc/150?u=${entry.username}`,
                    categories: JSON.stringify(entry.categories),
                    earnings: Math.round(entry.earnings * multiplier),
                    conversions: Math.round((entry.earnings / 100) * multiplier),
                    period,
                    rank: i + 1,
                },
            })
        }
    }
    console.log('✅ Created leaderboard snapshots')

    console.log('🎉 Seed complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

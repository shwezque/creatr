import { z } from 'zod'

// Platform enums
export const PlatformSchema = z.enum(['youtube', 'tiktok', 'instagram'])
export const ConnectionStatusSchema = z.enum(['connected', 'pending', 'error', 'disconnected'])
export const AnalysisStatusSchema = z.enum([
    'idle',
    'fetching',
    'analyzing',
    'scoring',
    'complete',
    'failed',
])
export const CreditTierSchema = z.enum(['A', 'B', 'C', 'D'])
export const LoanStatusSchema = z.enum(['pending', 'approved', 'rejected', 'active', 'completed'])

// Auth schemas
export const CreateSessionSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).optional(),
})

// Social connection schemas
export const ConnectSocialSchema = z.object({
    platform: PlatformSchema,
})

export const DisconnectSocialSchema = z.object({
    platform: PlatformSchema,
})

// Analysis schemas
export const StartAnalysisSchema = z.object({
    platforms: z.array(PlatformSchema).optional(),
})

// Product schemas
export const ProductFilterSchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minRating: z.number().min(0).max(5).optional(),
    minCommission: z.number().min(0).max(100).optional(),
    sortBy: z.enum(['fit', 'commission', 'rating', 'price', 'newest']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(50).optional(),
})

export const AddCreatorProductSchema = z.object({
    productId: z.string(),
})

export const RemoveCreatorProductSchema = z.object({
    productId: z.string(),
})

export const GenerateShoplinkSchema = z.object({
    productId: z.string(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
})

// Analytics schemas
export const SimulateEventsSchema = z.object({
    productId: z.string().optional(),
    clicks: z.number().int().positive().optional(),
    conversions: z.number().int().positive().optional(),
})

// Leaderboard schemas
export const LeaderboardQuerySchema = z.object({
    range: z.enum(['7d', '30d', 'all']).optional(),
    limit: z.number().int().positive().max(100).optional(),
})

// Co-create schemas
export const CoCreateApplySchema = z.object({
    briefId: z.string().optional(),
    categories: z.array(z.string()),
    message: z.string().min(10).max(1000),
})

// Credit schemas
export const UpdateConsentSchema = z.object({
    consent: z.boolean(),
})

// Loan schemas
export const LoanApplicationSchema = z.object({
    offerId: z.string(),
    amount: z.number().positive(),
    purpose: z.string().min(1).max(500),
    legalName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
    country: z.string().min(2),
    payoutAccount: z.string().optional(),
    kycCompleted: z.boolean(),
})

// Export all schema types
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>
export type ConnectSocialInput = z.infer<typeof ConnectSocialSchema>
export type DisconnectSocialInput = z.infer<typeof DisconnectSocialSchema>
export type StartAnalysisInput = z.infer<typeof StartAnalysisSchema>
export type ProductFilterInput = z.infer<typeof ProductFilterSchema>
export type AddCreatorProductInput = z.infer<typeof AddCreatorProductSchema>
export type GenerateShoplinkInput = z.infer<typeof GenerateShoplinkSchema>
export type SimulateEventsInput = z.infer<typeof SimulateEventsSchema>
export type LeaderboardQueryInput = z.infer<typeof LeaderboardQuerySchema>
export type CoCreateApplyInput = z.infer<typeof CoCreateApplySchema>
export type UpdateConsentInput = z.infer<typeof UpdateConsentSchema>
export type LoanApplicationInput = z.infer<typeof LoanApplicationSchema>

// Platform types
export type Platform = 'youtube' | 'tiktok' | 'instagram'

export type ConnectionStatus = 'connected' | 'pending' | 'error' | 'disconnected'

export type AnalysisStatus = 'idle' | 'fetching' | 'analyzing' | 'scoring' | 'complete' | 'failed'

export type CreditTier = 'A' | 'B' | 'C' | 'D'

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed'

export type CoCreateStatus = 'not_eligible' | 'eligible' | 'applied' | 'accepted' | 'rejected'

// User & Auth
export interface User {
    id: string
    email: string
    name: string
    username: string
    avatarUrl?: string
    createdAt: string
    updatedAt: string
}

// Social Connections
export interface SocialConnection {
    id: string
    userId: string
    platform: Platform
    status: ConnectionStatus
    handle?: string
    displayName?: string
    avatarUrl?: string
    followers?: number
    avgViews?: number
    accountAge?: number // months
    connectedAt?: string
    metadata?: Record<string, unknown>
}

// Analysis
export interface AnalysisSummary {
    id: string
    userId: string
    status: AnalysisStatus
    contentCategories: ContentCategory[]
    audienceRegion?: string
    audienceLanguage?: string
    engagementScore: number // 0-100
    consistencyScore: number // 0-100
    recommendedNiches: string[]
    completedAt?: string
}

export interface ContentCategory {
    name: string
    confidence: number // 0-100
}

// Products
export interface Product {
    id: string
    name: string
    brand: string
    brandLogoUrl?: string
    imageUrl: string
    images: string[]
    price: number
    srp: number
    commission: number // percentage
    commissionAmount: number // fixed amount
    rating: number
    soldCount: number
    category: string
    subcategory?: string
    description: string
    benefits: string[]
    contentHooks: string[]
    isVerified: boolean
}

export interface CreatorProduct {
    id: string
    userId: string
    productId: string
    product: Product
    addedAt: string
    shoplink?: string
    shoplinkCreatedAt?: string
}

// Analytics
export interface AnalyticsSummary {
    totalClicks: number
    totalConversions: number
    totalRevenue: number
    totalCommission: number
    ctr: number
    cvr: number
    clicksTrend: number
    conversionsTrend: number
    revenueTrend: number
}

export interface ProductAnalytics {
    productId: string
    product: Product
    clicks: number
    conversions: number
    revenue: number
    commission: number
    ctr: number
    cvr: number
    trend: number
}

// Leaderboard
export interface LeaderboardEntry {
    rank: number
    userId: string
    username: string
    displayName: string
    avatarUrl?: string
    categories: string[]
    earnings: number
    conversions: number
    isCurrentUser?: boolean
}

// Co-Create
export interface CoCreateEligibility {
    isEligible: boolean
    progress: number // 0-100
    requirements: EligibilityRequirement[]
}

export interface EligibilityRequirement {
    name: string
    description: string
    current: number
    target: number
    met: boolean
}

export interface BrandBrief {
    id: string
    brandName: string
    brandLogoUrl: string
    title: string
    description: string
    compensation: string
    deadline: string
    categories: string[]
    requirements: string[]
    status?: 'available' | 'applied' | 'accepted' | 'rejected'
}

export interface CoCreateApplication {
    id: string
    userId: string
    briefId?: string
    categories: string[]
    message: string
    status: CoCreateStatus
    createdAt: string
}

// Credit & Loans
export interface CreditConsent {
    userId: string
    hasConsented: boolean
    consentedAt?: string
    revokedAt?: string
    dataExplanation: string[]
    notUsed: string[]
}

export interface CreditAssessment {
    userId: string
    tier: CreditTier
    score: number // 0-1000
    maxLoanAmount: number
    aprRange: { min: number; max: number }
    termOptions: number[] // months
    factors: CreditFactor[]
    calculatedAt: string
}

export interface CreditFactor {
    name: string
    description: string
    impact: 'positive' | 'neutral' | 'negative'
    score: number
    maxScore: number
}

export interface LoanOffer {
    id: string
    partnerId: string
    partnerName: string
    partnerLogoUrl: string
    amount: number
    apr: number
    termMonths: number
    monthlyPayment: number
    totalRepayment: number
    requirements: string[]
}

export interface LoanApplication {
    id: string
    userId: string
    offerId: string
    amount: number
    purpose: string
    status: LoanStatus
    legalName: string
    email: string
    phone: string
    country: string
    payoutAccount?: string
    kycCompleted: boolean
    createdAt: string
    updatedAt: string
    approvedAt?: string
    rejectedReason?: string
    repaymentSchedule?: RepaymentItem[]
}

export interface RepaymentItem {
    dueDate: string
    amount: number
    status: 'upcoming' | 'paid' | 'overdue'
}

// Improvement tips for credit
export interface CreditImprovementTip {
    id: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    action: string
    actionRoute?: string
}

// API Response types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: ApiError
    requestId?: string
}

export interface ApiError {
    code: string
    message: string
    details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

// Platforms
export const PLATFORMS = ['youtube', 'tiktok', 'instagram'] as const

export const PLATFORM_CONFIG = {
    youtube: {
        name: 'YouTube',
        icon: 'youtube',
        color: '#FF0000',
        connectUrl: '/auth/youtube',
    },
    tiktok: {
        name: 'TikTok',
        icon: 'tiktok',
        color: '#000000',
        connectUrl: '/auth/tiktok',
    },
    instagram: {
        name: 'Instagram',
        icon: 'instagram',
        color: '#E4405F',
        connectUrl: '/auth/instagram',
    },
} as const

// Product categories
export const PRODUCT_CATEGORIES = [
    'Beauty',
    'Fashion',
    'Food',
    'Lifestyle',
    'Tech',
    'Health',
    'Home',
    'Travel',
    'Fitness',
    'Entertainment',
] as const

// Credit tiers config
export const CREDIT_TIER_CONFIG = {
    A: {
        name: 'Excellent',
        minScore: 800,
        maxLoanAmount: 500000,
        aprRange: { min: 8, max: 12 },
        color: '#22C55E',
    },
    B: {
        name: 'Good',
        minScore: 650,
        maxLoanAmount: 250000,
        aprRange: { min: 12, max: 18 },
        color: '#3B82F6',
    },
    C: {
        name: 'Fair',
        minScore: 500,
        maxLoanAmount: 100000,
        aprRange: { min: 18, max: 24 },
        color: '#F59E0B',
    },
    D: {
        name: 'Limited',
        minScore: 0,
        maxLoanAmount: 50000,
        aprRange: { min: 24, max: 36 },
        color: '#EF4444',
    },
} as const

// Loan term options (months)
export const LOAN_TERM_OPTIONS = [3, 6, 12, 24] as const

// Currency
export const CURRENCY = {
    code: 'PHP',
    symbol: '₱',
    locale: 'en-PH',
} as const

// API error codes
export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    CONSENT_REQUIRED: 'CONSENT_REQUIRED',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    ANALYSIS_IN_PROGRESS: 'ANALYSIS_IN_PROGRESS',
    INSUFFICIENT_CONNECTIONS: 'INSUFFICIENT_CONNECTIONS',
} as const

// Leaderboard ranges
export const LEADERBOARD_RANGES = ['7d', '30d', 'all'] as const

// Co-create eligibility requirements
export const COCREATE_REQUIREMENTS = {
    minFollowers: 10000,
    minEngagementScore: 60,
    minConsistencyScore: 70,
    minSalesCount: 5,
} as const

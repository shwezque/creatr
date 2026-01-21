import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, ChevronRight, Shield, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Switch } from '@/shared/ui/switch'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency, cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/credit')({
    component: CreditPage,
})

const tierColors: Record<string, string> = {
    A: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    B: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    C: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    D: 'text-red-600 bg-red-100 dark:bg-red-900/30',
}

interface CreditState {
    hasConsented: boolean
    hasScore: boolean
    assessment?: {
        tier: string
        score: number
        maxLoanAmount: number
    }
}

const mockOffers = [
    {
        id: '1',
        partnerName: 'Creator Finance',
        partnerLogoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
        amount: 5000,
        apr: 12.9,
        termMonths: 12,
        monthlyPayment: 445,
    },
    {
        id: '2',
        partnerName: 'Influencer Capital',
        partnerLogoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop',
        amount: 10000,
        apr: 9.9,
        termMonths: 24,
        monthlyPayment: 460,
    },
]

const mockTips = [
    { id: '1', title: 'Connect more platforms', description: 'Link additional social accounts to improve your score.', actionRoute: '/app/connect' },
    { id: '2', title: 'Add products to your shop', description: 'A larger product catalog shows engagement potential.', actionRoute: '/app/recommendations' },
    { id: '3', title: 'Generate shoplinks', description: 'Active shoplinks demonstrate monetization capability.', actionRoute: '/app/shoplinks' },
]

const consentData = {
    dataExplanation: [
        'Your connected social account metrics (follower count, engagement rate)',
        'Your affiliate performance data (clicks, conversions, earnings)',
        'Your product selection and shoplink activity',
    ],
    notUsed: [
        'Your private messages or DMs',
        'Your personal content or media files',
        'Any data from accounts you have not connected',
    ],
}

function getCreditState(): CreditState {
    if (typeof window === 'undefined') return { hasConsented: false, hasScore: false }
    const stored = localStorage.getItem('creatr-credit')
    return stored ? JSON.parse(stored) : { hasConsented: false, hasScore: false }
}

function saveCreditState(state: CreditState) {
    localStorage.setItem('creatr-credit', JSON.stringify(state))
}

// SVG Bill component
function PesoBill({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg viewBox="0 0 80 40" className={className} style={style}>
            <rect x="2" y="2" width="76" height="36" rx="4" fill="url(#billGradient)" stroke="#15803d" strokeWidth="1.5" />
            <text x="40" y="26" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#166534">₱</text>
            <circle cx="12" cy="20" r="6" fill="#22c55e" opacity="0.3" />
            <circle cx="68" cy="20" r="6" fill="#22c55e" opacity="0.3" />
            <defs>
                <linearGradient id="billGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dcfce7" />
                    <stop offset="50%" stopColor="#bbf7d0" />
                    <stop offset="100%" stopColor="#86efac" />
                </linearGradient>
            </defs>
        </svg>
    )
}

// SVG Bank building icon with jiggle animation
function BankIcon() {
    return (
        <svg viewBox="0 0 80 70" className="w-20 h-16 animate-[jiggle_0.5s_ease-in-out_infinite]">
            {/* Roof/Triangle */}
            <polygon points="40,5 75,28 5,28" fill="url(#bankGradient)" />
            {/* Roof line */}
            <rect x="5" y="26" width="70" height="5" rx="1" fill="#059669" />
            {/* Main body */}
            <rect x="8" y="31" width="64" height="30" fill="url(#bankGradient)" />
            {/* Columns */}
            <rect x="14" y="34" width="6" height="24" rx="1" fill="#047857" />
            <rect x="28" y="34" width="6" height="24" rx="1" fill="#047857" />
            <rect x="46" y="34" width="6" height="24" rx="1" fill="#047857" />
            <rect x="60" y="34" width="6" height="24" rx="1" fill="#047857" />
            {/* Base */}
            <rect x="3" y="61" width="74" height="6" rx="2" fill="#059669" />
            {/* Door */}
            <rect x="33" y="45" width="14" height="16" rx="2" fill="#064e3b" />
            {/* Peso symbol on top */}
            <text x="40" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ecfdf5">₱</text>
            <defs>
                <linearGradient id="bankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
            </defs>
        </svg>
    )
}


// Professional wealth-themed animation component with piggybank and flying bills
function WealthAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-pink-500/5 animate-pulse" />

            {/* Flying peso bills */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${15 + (i * 12)}%`,
                        animation: `flyBill ${2 + (i * 0.3)}s ease-out ${i * 0.4}s infinite`,
                        top: '60%',
                        opacity: 0,
                    }}
                >
                    <PesoBill className="w-12 h-6" style={{ transform: `rotate(${-15 + i * 8}deg)` }} />
                </div>
            ))}

            <style>{`
                @keyframes flyBill {
                    0% { 
                        transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
                        opacity: 0;
                    }
                    20% {
                        opacity: 0.9;
                    }
                    100% { 
                        transform: translateY(-120px) translateX(30px) scale(1.1) rotate(15deg);
                        opacity: 0;
                    }
                }
                @keyframes jiggle {
                    0%, 100% { transform: rotate(-3deg); }
                    25% { transform: rotate(3deg) scale(1.05); }
                    50% { transform: rotate(-2deg); }
                    75% { transform: rotate(2deg) scale(1.02); }
                }
            `}</style>
        </div>
    )
}

function CreditPage() {
    const { toast } = useToast()
    const [creditState, setCreditState] = useState<CreditState>({ hasConsented: false, hasScore: false })
    const [isLoading, setIsLoading] = useState(false)
    const [isCalculating, setIsCalculating] = useState(false)

    useEffect(() => {
        setCreditState(getCreditState())
    }, [])

    const handleConsent = async (value: boolean) => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const newState: CreditState = value
            ? { hasConsented: true, hasScore: false }
            : { hasConsented: false, hasScore: false }

        setCreditState(newState)
        saveCreditState(newState)
        setIsLoading(false)
        toast({ title: 'Consent updated' })
    }

    const handleCalculateScore = async () => {
        setIsLoading(true)
        setIsCalculating(true)

        await new Promise(resolve => setTimeout(resolve, 3500))

        // Generate random score
        const score = Math.floor(Math.random() * 300) + 600
        const tier = score >= 800 ? 'A' : score >= 700 ? 'B' : score >= 600 ? 'C' : 'D'
        const maxLoanAmount = score >= 800 ? 15000 : score >= 700 ? 10000 : score >= 600 ? 5000 : 2500

        const newState: CreditState = {
            hasConsented: true,
            hasScore: true,
            assessment: { tier, score, maxLoanAmount },
        }

        setCreditState(newState)
        saveCreditState(newState)
        setIsCalculating(false)
        setIsLoading(false)
    }

    const { hasConsented, hasScore, assessment } = creditState

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Creator Credit</h1>
                <p className="text-muted-foreground">
                    Get loan offers based on your creator performance.
                </p>
            </div>

            {!hasConsented && (
                <ConsentSection
                    consent={consentData}
                    onConsent={handleConsent}
                    isLoading={isLoading}
                />
            )}

            {hasConsented && !hasScore && !isCalculating && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
                        <h2 className="mb-2 text-lg font-semibold">Calculate Your Creator Score</h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            We'll analyze your connected accounts and performance to generate a credit tier.
                        </p>
                        <Button onClick={handleCalculateScore} disabled={isLoading}>
                            {isLoading ? 'Calculating...' : 'Calculate Score'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Professional Wealth Loading Animation */}
            {isCalculating && (
                <Card className="relative overflow-hidden border-emerald-500/20">
                    <WealthAnimation />
                    <CardContent className="py-12 text-center relative z-10">
                        {/* Bank icon illustration */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <BankIcon />
                                {/* Sparkle effects */}
                                <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                                <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '500ms' }} />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-1 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                            Unlocking Your Potential
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Analyzing your creator profile for financing opportunities
                        </p>

                        {/* Progress indicator */}
                        <div className="max-w-xs mx-auto mb-6">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                                    style={{ animation: 'progress 3s ease-in-out forwards' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex items-center justify-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Analyzing your social metrics
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                                Evaluating earning potential
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                                Finding the best offers for you
                            </p>
                        </div>
                    </CardContent>
                    <style>{`
                        @keyframes progress {
                            0% { width: 0%; }
                            100% { width: 100%; }
                        }
                    `}</style>
                </Card>
            )}

            {hasConsented && hasScore && assessment && (
                <>
                    <ScoreCard assessment={assessment} />

                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Available Offers</h2>
                        <div className="space-y-3">
                            {mockOffers.map((offer) => (
                                <Card key={offer.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                                <img src={offer.partnerLogoUrl} alt={offer.partnerName} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{offer.partnerName}</p>
                                                <p className="text-sm text-muted-foreground">Up to {formatCurrency(offer.amount)}</p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Apply <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                                            <span>{offer.apr}% APR</span>
                                            <span>{offer.termMonths} months</span>
                                            <span>{formatCurrency(offer.monthlyPayment)}/mo</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Improve Your Score</h2>
                        <div className="space-y-2">
                            {mockTips.map((tip) => (
                                <Card key={tip.id}>
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-medium">{tip.title}</p>
                                            <p className="text-sm text-muted-foreground">{tip.description}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={tip.actionRoute}>
                                                <ArrowRight className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 text-center">
                        <button
                            onClick={() => handleConsent(false)}
                            className="text-sm text-muted-foreground hover:text-destructive"
                        >
                            Revoke consent and delete my credit data
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

function ConsentSection({
    consent,
    onConsent,
    isLoading,
}: {
    consent: { dataExplanation: string[]; notUsed: string[] }
    onConsent: (value: boolean) => void
    isLoading: boolean
}) {
    const [agreed, setAgreed] = useState(false)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Consent Required
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    To calculate your creator credit score, we need your permission to analyze certain data.
                </p>

                <div>
                    <p className="mb-2 text-sm font-medium">Data we will use:</p>
                    <ul className="space-y-1">
                        {consent.dataExplanation.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium">Data we will NOT use:</p>
                    <ul className="space-y-1">
                        {consent.notUsed.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Switch checked={agreed} onCheckedChange={setAgreed} />
                    <span className="text-sm">I understand and agree to the data usage terms</span>
                </div>

                <Button className="w-full" disabled={!agreed || isLoading} onClick={() => onConsent(true)}>
                    {isLoading ? 'Processing...' : 'Give Consent'}
                </Button>
            </CardContent>
        </Card>
    )
}

function ScoreCard({ assessment }: { assessment: { tier: string; score: number; maxLoanAmount: number } }) {
    const tierColor = tierColors[assessment.tier] || tierColors.D

    return (
        <Card className="overflow-hidden">
            <div className={cn('p-4', tierColor)}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-80">Creator Tier</p>
                        <p className="text-3xl font-bold">Tier {assessment.tier}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium opacity-80">Credit Score</p>
                        <p className="text-3xl font-bold">{assessment.score}</p>
                    </div>
                </div>
            </div>
            <CardContent className="p-4">
                <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Loan Eligibility</span>
                    <span className="font-medium">Up to {formatCurrency(assessment.maxLoanAmount)}</span>
                </div>
                <Progress value={(assessment.score / 1000) * 100} className="h-2" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>1000</span>
                </div>
            </CardContent>
        </Card>
    )
}

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

function CreditPage() {
    const { toast } = useToast()
    const [creditState, setCreditState] = useState<CreditState>({ hasConsented: false, hasScore: false })
    const [isLoading, setIsLoading] = useState(false)

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
        await new Promise(resolve => setTimeout(resolve, 1500))

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

            {hasConsented && !hasScore && (
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

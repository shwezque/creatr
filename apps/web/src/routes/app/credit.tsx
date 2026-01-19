import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowRight, Check, ChevronRight, Loader2, Shield, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Switch } from '@/shared/ui/switch'
import { useAuth } from '@/app/providers/auth-provider'
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

function CreditPage() {
    const { token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: consent, isLoading: consentLoading } = useQuery({
        queryKey: ['credit', 'consent'],
        queryFn: async () => {
            const res = await fetch('/api/credit/consent', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const { data: tips } = useQuery({
        queryKey: ['credit', 'tips'],
        queryFn: async () => {
            const res = await fetch('/api/credit/tips', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
        enabled: !!consent?.data?.hasConsented,
    })

    const updateConsentMutation = useMutation({
        mutationFn: async (value: boolean) => {
            const res = await fetch('/api/credit/consent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ consent: value }),
            })
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credit'] })
            toast({ title: 'Consent updated' })
        },
    })

    const calculateScoreMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/credit/score', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credit'] })
        },
    })

    const { data: assessment } = useQuery({
        queryKey: ['credit', 'assessment'],
        queryFn: async () => {
            // Check if we already have an assessment by getting loan offers
            const res = await fetch('/api/credit/loans/offers', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
        enabled: !!consent?.data?.hasConsented,
    })

    const hasConsented = consent?.data?.hasConsented
    const hasScore = !!assessment?.data?.assessment

    if (consentLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

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
                    consent={consent?.data}
                    onConsent={(value) => updateConsentMutation.mutate(value)}
                    isLoading={updateConsentMutation.isPending}
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
                        <Button onClick={() => calculateScoreMutation.mutate()} disabled={calculateScoreMutation.isPending}>
                            {calculateScoreMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Calculate Score
                        </Button>
                    </CardContent>
                </Card>
            )}

            {hasConsented && hasScore && (
                <>
                    <ScoreCard assessment={assessment.data.assessment} />

                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Available Offers</h2>
                        <div className="space-y-3">
                            {assessment.data.offers?.map((offer: {
                                id: string
                                partnerName: string
                                partnerLogoUrl: string
                                amount: number
                                apr: number
                                termMonths: number
                                monthlyPayment: number
                            }) => (
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

                    {tips?.data?.length > 0 && (
                        <div>
                            <h2 className="mb-3 text-lg font-semibold">Improve Your Score</h2>
                            <div className="space-y-2">
                                {tips.data.map((tip: { id: string; title: string; description: string; actionRoute: string }) => (
                                    <Card key={tip.id}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div>
                                                <p className="font-medium">{tip.title}</p>
                                                <p className="text-sm text-muted-foreground">{tip.description}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={tip.actionRoute}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 text-center">
                        <button
                            onClick={() => updateConsentMutation.mutate(false)}
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
                        {consent?.dataExplanation?.map((item, i) => (
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
                        {consent?.notUsed?.map((item, i) => (
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
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Give Consent
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

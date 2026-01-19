import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/analyze')({
    component: AnalyzePage,
})

const steps = [
    { id: 1, label: 'Fetching posts', description: 'Retrieving content from your accounts' },
    { id: 2, label: 'Analyzing content', description: 'Identifying topics and themes' },
    { id: 3, label: 'Computing signals', description: 'Analyzing engagement patterns' },
    { id: 4, label: 'Generating fit', description: 'Finding your best product matches' },
]

// Total analysis time: 5 seconds (1.25 seconds per step)
const STEP_DURATION_MS = 1250

function AnalyzePage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isComplete, setIsComplete] = useState(false)
    const [progress, setProgress] = useState(0)

    // Check if analysis was already completed
    useEffect(() => {
        const analysisComplete = localStorage.getItem('creatr-analysis-complete')
        if (analysisComplete === 'true') {
            setIsComplete(true)
            setCurrentStep(5) // Past all steps
        }
    }, [])

    // Progress animation within each step
    useEffect(() => {
        if (isComplete) return

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0
                return prev + 10
            })
        }, STEP_DURATION_MS / 10)

        return () => clearInterval(progressInterval)
    }, [isComplete, currentStep])

    // Step progression - complete in 5 seconds total
    const advanceStep = useCallback(() => {
        if (isComplete) return

        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1)
            setProgress(0)
        } else if (currentStep === steps.length) {
            // All steps complete
            setCurrentStep(5)
            setIsComplete(true)
            localStorage.setItem('creatr-analysis-complete', 'true')
        }
    }, [currentStep, isComplete])

    useEffect(() => {
        if (isComplete) return

        const timer = setTimeout(advanceStep, STEP_DURATION_MS)
        return () => clearTimeout(timer)
    }, [advanceStep, isComplete])

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    {isComplete ? 'Analysis Complete!' : 'Analyzing Your Profile'}
                </h1>
                <p className="text-muted-foreground">
                    {isComplete
                        ? 'We found the best products for your audience.'
                        : 'This usually takes about 5 seconds...'}
                </p>
            </div>

            {!isComplete && (
                <div className="py-8">
                    <div className="relative mx-auto h-24 w-24">
                        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/50" />
                        <div className="absolute inset-4 flex items-center justify-center rounded-full bg-primary">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardContent className="space-y-4 p-6">
                    {steps.map((step) => {
                        const isActive = step.id === currentStep
                        const isDone = step.id < currentStep || isComplete

                        return (
                            <div key={step.id} className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                        isDone && 'border-green-500 bg-green-500',
                                        isActive && !isDone && 'border-primary',
                                        !isActive && !isDone && 'border-muted'
                                    )}
                                >
                                    {isDone ? (
                                        <Check className="h-4 w-4 text-white" />
                                    ) : isActive ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    ) : (
                                        <span className="text-sm text-muted-foreground">{step.id}</span>
                                    )}
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className={cn('font-medium', !isDone && !isActive && 'text-muted-foreground')}>
                                        {step.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    {isActive && !isDone && (
                                        <Progress value={progress} className="mt-2 h-1" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {isComplete && (
                <div className="flex justify-center">
                    <Button size="lg" asChild>
                        <Link to="/app/recommendations">
                            See Recommendations <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}


import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Check, Loader2, Edit2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { useToast } from '@/shared/ui/use-toast'

export const Route = createFileRoute('/app/analyze')({
    component: AnalyzePage,
})

const steps = [
    { id: 1, label: 'Fetching posts', description: 'Retrieving content from your accounts' },
    { id: 2, label: 'Analyzing content', description: 'Identifying topics and themes' },
    { id: 3, label: 'Computing signals', description: 'Analyzing engagement patterns' },
    { id: 4, label: 'Generating fit', description: 'Finding your best product matches' },
]

// Available content categories
const ALL_CATEGORIES = ['Beauty', 'Tech', 'Fashion', 'Fitness', 'Lifestyle', 'Food', 'Travel', 'Gaming', 'Home']

// Mock detected categories based on connected platforms
const DETECTED_CATEGORIES: Array<{ name: string; source: string; confidence: number }> = [
    { name: 'Beauty', source: 'Instagram', confidence: 92 },
    { name: 'Fashion', source: 'Instagram', confidence: 87 },
    { name: 'Lifestyle', source: 'TikTok', confidence: 78 },
    { name: 'Fitness', source: 'YouTube', confidence: 65 },
]

// Total analysis time: 3 seconds (750ms per step)
const STEP_DURATION_MS = 750

function getStoredCategories(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-categories')
    return stored ? JSON.parse(stored) : []
}

function saveCategories(categories: string[]) {
    localStorage.setItem('creatr-categories', JSON.stringify(categories))
}

function AnalyzePage() {
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = useState(1)
    const [isComplete, setIsComplete] = useState(false)
    const [progress, setProgress] = useState(0)
    const [categories, setCategories] = useState<Array<{ name: string; source: string; confidence: number }>>([])
    const [isEditing, setIsEditing] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    // Check if analysis was already completed
    useEffect(() => {
        const analysisComplete = localStorage.getItem('creatr-analysis-complete')
        if (analysisComplete === 'true') {
            setIsComplete(true)
            setCurrentStep(5) // Past all steps
            // Load stored categories or use detected ones
            const storedCats = getStoredCategories()
            if (storedCats.length > 0) {
                setCategories(storedCats.map(name => ({
                    name,
                    source: DETECTED_CATEGORIES.find(c => c.name === name)?.source || 'Custom',
                    confidence: DETECTED_CATEGORIES.find(c => c.name === name)?.confidence || 0
                })))
                setSelectedCategories(storedCats)
            } else {
                setCategories(DETECTED_CATEGORIES)
                setSelectedCategories(DETECTED_CATEGORIES.map(c => c.name))
            }
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
            // Set initial categories
            setCategories(DETECTED_CATEGORIES)
            setSelectedCategories(DETECTED_CATEGORIES.map(c => c.name))
            saveCategories(DETECTED_CATEGORIES.map(c => c.name))
        }
    }, [currentStep, isComplete])

    useEffect(() => {
        if (isComplete) return

        const timer = setTimeout(advanceStep, STEP_DURATION_MS)
        return () => clearTimeout(timer)
    }, [advanceStep, isComplete])

    const toggleCategory = (categoryName: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryName)) {
                return prev.filter(c => c !== categoryName)
            } else {
                return [...prev, categoryName]
            }
        })
    }

    const saveChanges = () => {
        if (selectedCategories.length === 0) {
            toast({ title: 'Please select at least one category' })
            return
        }
        saveCategories(selectedCategories)
        setCategories(selectedCategories.map(name => ({
            name,
            source: DETECTED_CATEGORIES.find(c => c.name === name)?.source || 'Custom',
            confidence: DETECTED_CATEGORIES.find(c => c.name === name)?.confidence || 0
        })))
        setIsEditing(false)
        toast({ title: 'Categories updated!' })
    }

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    {isComplete ? 'Analysis Complete!' : 'Analyzing Your Profile'}
                </h1>
                <p className="text-muted-foreground">
                    {isComplete
                        ? 'We identified your content categories and found the best products for you.'
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

            {/* Content Categories Section - shown after analysis */}
            {isComplete && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Your Content Categories</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? (
                                    <>Cancel</>
                                ) : (
                                    <><Edit2 className="h-4 w-4 mr-1" /> Edit</>
                                )}
                            </Button>
                        </div>

                        {!isEditing ? (
                            <div className="space-y-3">
                                {categories.map((cat) => (
                                    <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary">{cat.name}</Badge>
                                            <span className="text-sm text-muted-foreground">
                                                via {cat.source}
                                            </span>
                                        </div>
                                        {cat.confidence > 0 && (
                                            <span className="text-sm font-medium text-green-600">
                                                {cat.confidence}% match
                                            </span>
                                        )}
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground mt-3">
                                    These categories help us recommend products that align with your content.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Select the categories that best describe your content:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_CATEGORIES.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat)
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className={cn(
                                                    'px-3 py-2 rounded-full text-sm font-medium transition-all',
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted hover:bg-muted/80'
                                                )}
                                            >
                                                {isSelected && <Check className="inline h-3 w-3 mr-1" />}
                                                {cat}
                                            </button>
                                        )
                                    })}
                                </div>
                                <Button onClick={saveChanges} className="w-full">
                                    Save Categories
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

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

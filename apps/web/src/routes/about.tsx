import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export const Route = createFileRoute('/about')({
    component: AboutPage,
})

function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container px-4 py-8">
                <Button variant="ghost" size="sm" asChild className="mb-6">
                    <Link to="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Link>
                </Button>

                <h1 className="mb-6 text-3xl font-bold">About Creatr</h1>

                <div className="prose prose-neutral max-w-none dark:prose-invert">
                    <p className="text-lg text-muted-foreground">
                        Creatr is a platform designed to help content creators monetize their social media presence
                        through affiliate marketing and brand partnerships.
                    </p>

                    <h2 className="mt-8 text-xl font-semibold">How It Works</h2>
                    <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
                        <li>Connect your social accounts (YouTube, TikTok, Instagram)</li>
                        <li>Our AI analyzes your content to understand your niche</li>
                        <li>Get personalized product recommendations with competitive commissions</li>
                        <li>Create shoplinks and share with your audience</li>
                        <li>Earn commissions on every sale</li>
                    </ol>

                    <h2 className="mt-8 text-xl font-semibold">Creatr Credit</h2>
                    <p className="text-muted-foreground">
                        Based on your creator performance, you may also qualify for exclusive loan offers through
                        our partner institutions. We calculate an estimated credit score using your platform metrics,
                        engagement rates, and affiliate performance - never your personal financial data.
                    </p>

                    <h2 className="mt-8 text-xl font-semibold">Co-Create with Brands</h2>
                    <p className="text-muted-foreground">
                        High-performing creators can unlock access to brand collaboration opportunities.
                        Get paid to create content and grow your audience with verified brands.
                    </p>
                </div>

                <div className="mt-12">
                    <Button asChild>
                        <Link to="/">Get Started</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

import type { ReactNode } from 'react'
import { TopBar } from './top-bar'
import { BottomNav } from './bottom-nav'

interface AppShellProps {
    children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background">
            <TopBar />
            <main className="container pb-20 pt-4 md:pb-8">{children}</main>
            <BottomNav />
        </div>
    )
}

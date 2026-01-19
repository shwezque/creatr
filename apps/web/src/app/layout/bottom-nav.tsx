import { Link, useLocation } from '@tanstack/react-router'
import { LayoutDashboard, ShoppingBag, BarChart3, Sparkles, User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const navItems = [
    { path: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/shoplinks', icon: ShoppingBag, label: 'Shop Links' },
    { path: '/app/cocreate', icon: Sparkles, label: 'Co-Create' },
    { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
    const location = useLocation()
    const currentPath = location.pathname

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-bottom">
            <div className="flex items-center justify-around py-2">
                {navItems.slice(0, 5).map((item) => {
                    const isActive = currentPath === item.path ||
                        (item.path !== '/app' && currentPath.startsWith(item.path))
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

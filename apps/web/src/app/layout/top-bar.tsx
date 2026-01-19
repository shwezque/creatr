import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useTheme } from '@/app/providers/theme-provider'

interface TopBarProps {
    title?: string
    showBack?: boolean
}

export function TopBar({ title = 'Creatr' }: TopBarProps) {
    const { theme, setTheme } = useTheme()
    const navigate = useNavigate()

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    const handleNotificationsClick = () => {
        navigate({ to: '/app/notifications' })
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
            <div className="container flex h-14 items-center justify-between">
                <Link to="/app" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">C</span>
                    </div>
                    <span className="text-lg font-semibold">{title}</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" onClick={handleNotificationsClick}>
                        <Bell className="h-5 w-5" />
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            3
                        </span>
                    </Button>
                </div>
            </div>
        </header>
    )
}

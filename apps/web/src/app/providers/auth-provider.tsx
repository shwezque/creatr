import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
    id: string
    email: string
    name: string
    username: string
    avatarUrl?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, name?: string) => Promise<void>
    loginDemo: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo user data for static hosting
const DEMO_USER: User = {
    id: 'demo-user-001',
    email: 'demo@creatr.io',
    name: 'Demo Creator',
    username: 'demo_creator',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
}

const DEMO_TOKEN = 'demo-static-token'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('creatr-token')
        }
        return null
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            if (!token) {
                setIsLoading(false)
                return
            }

            // For demo/static hosting, if we have a token, use mock user
            if (token === DEMO_TOKEN || token.startsWith('demo-')) {
                setUser(DEMO_USER)
                setIsLoading(false)
                return
            }

            // Try to verify with backend (will fail on static hosting)
            try {
                const response = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await response.json()
                if (data.success) {
                    setUser(data.data)
                } else {
                    // Fallback to demo user if we have a token but backend fails
                    setUser(DEMO_USER)
                }
            } catch {
                // Fallback to demo user for static hosting
                setUser(DEMO_USER)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [token])

    const login = async (email: string, name?: string) => {
        // For demo purposes, create a mock user
        const username = email.split('@')[0] || 'user'
        const mockUser: User = {
            id: 'user-' + Date.now(),
            email,
            name: name || username,
            username,
        }
        localStorage.setItem('creatr-token', DEMO_TOKEN)
        localStorage.setItem('creatr-user', JSON.stringify(mockUser))
        setToken(DEMO_TOKEN)
        setUser(mockUser)
    }

    const loginDemo = async () => {
        // Directly set demo user - no API call needed
        localStorage.setItem('creatr-token', DEMO_TOKEN)
        localStorage.setItem('creatr-user', JSON.stringify(DEMO_USER))
        setToken(DEMO_TOKEN)
        setUser(DEMO_USER)
    }

    const logout = async () => {
        localStorage.removeItem('creatr-token')
        localStorage.removeItem('creatr-user')
        localStorage.removeItem('creatr-connections')
        localStorage.removeItem('creatr-shop-products')
        localStorage.removeItem('creatr-analysis-complete')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                login,
                loginDemo,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}


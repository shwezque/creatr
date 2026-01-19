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

const API_BASE = import.meta.env.VITE_API_URL || '/api'

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

            try {
                const response = await fetch(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await response.json()
                if (data.success) {
                    setUser(data.data)
                } else {
                    localStorage.removeItem('creatr-token')
                    setToken(null)
                }
            } catch {
                localStorage.removeItem('creatr-token')
                setToken(null)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [token])

    const login = async (email: string, name?: string) => {
        const response = await fetch(`${API_BASE}/auth/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name }),
        })
        const data = await response.json()
        if (data.success) {
            localStorage.setItem('creatr-token', data.data.token)
            setToken(data.data.token)
            setUser(data.data.user)
        } else {
            throw new Error(data.error?.message || 'Login failed')
        }
    }

    const loginDemo = async () => {
        const response = await fetch(`${API_BASE}/auth/demo`, {
            method: 'POST',
        })
        const data = await response.json()
        if (data.success) {
            localStorage.setItem('creatr-token', data.data.token)
            setToken(data.data.token)
            setUser(data.data.user)
        } else {
            throw new Error(data.error?.message || 'Demo login failed')
        }
    }

    const logout = async () => {
        if (token) {
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
        }
        localStorage.removeItem('creatr-token')
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

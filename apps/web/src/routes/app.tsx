import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/app/layout/app-shell'

export const Route = createFileRoute('/app')({
    beforeLoad: () => {
        const token = localStorage.getItem('creatr-token')
        if (!token) {
            throw redirect({ to: '/' })
        }
    },
    component: AppLayout,
})

function AppLayout() {
    return (
        <AppShell>
            <Outlet />
        </AppShell>
    )
}

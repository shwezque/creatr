import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/cocreate')({
    component: CoCreatePage,
})

// Mock brands data
const mockBrands = [
    { id: '1', name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop', category: 'Sports/Fashion', status: 'Active Campaign' },
    { id: '2', name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=80&h=80&fit=crop', category: 'Tech/Electronics', status: 'Pending' },
    { id: '3', name: 'L\'Oreal', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop', category: 'Beauty/Skincare', status: 'Open to Apply' },
    { id: '4', name: 'Spotify', logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=80&h=80&fit=crop', category: 'Music/Entertainment', status: 'Open to Apply' },
    { id: '5', name: 'Adidas', logo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=80&h=80&fit=crop', category: 'Sports/Fashion', status: 'Open to Apply' },
]

function CoCreatePage() {
    const [activeTab, setActiveTab] = useState('brands')
    const [twinActive, setTwinActive] = useState(true)
    const [twinSettings] = useState({
        personality: 'Friendly',
        tone: 'Short and clear answers',
        knowledgeBase: 'General',
        memoryLevel: 'Remembers everything',
        responseSpeed: 'Fast',
        language: 'English',
        updateFrequency: 'Weekly',
    })

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="brands">Brands</TabsTrigger>
                    <TabsTrigger value="digital-twin">Digital Twin</TabsTrigger>
                </TabsList>

                <TabsContent value="brands" className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">Collaborate with top brands and earn from sponsored content.</p>

                    {mockBrands.map((brand) => (
                        <Card key={brand.id}>
                            <CardContent className="flex items-center gap-3 p-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{brand.name}</p>
                                    <p className="text-xs text-muted-foreground">{brand.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        'rounded-full px-2 py-0.5 text-xs',
                                        brand.status === 'Active Campaign' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                                        brand.status === 'Pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                                        brand.status === 'Open to Apply' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    )}>
                                        {brand.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="digital-twin" className="mt-4 space-y-4">
                    {/* Twin Avatar Preview */}
                    <div className="flex justify-center gap-4 py-4">
                        <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-blue-100">
                            <img src="/modern-mulan.jpg" alt="Twin preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-blue-100">
                            <img src="/modern-mulan.jpg" alt="Twin preview" className="h-full w-full object-cover" />
                        </div>
                    </div>
                    <p className="text-center text-sm text-primary">See Modern Mulan in Action</p>

                    {/* Name Section */}
                    <div>
                        <p className="mb-1 text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                        <Card>
                            <CardContent className="p-3">
                                <p className="font-medium">Modern Mulan</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings Section */}
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wide">Settings</p>
                        <Card>
                            <CardContent className="flex items-center justify-between p-3">
                                <span>Activate</span>
                                <Switch checked={twinActive} onCheckedChange={setTwinActive} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Configure Section */}
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wide">Configure</p>
                        <div className="space-y-1">
                            <ConfigRow label="Personality" value={twinSettings.personality} />
                            <ConfigRow label="Tone" value={twinSettings.tone} />
                            <ConfigRow label="Knowledge Base" value={twinSettings.knowledgeBase} />
                            <ConfigRow label="Memory Level" value={twinSettings.memoryLevel} />
                            <ConfigRow label="Response Speed" value={twinSettings.responseSpeed} />
                            <ConfigRow label="Language" value={twinSettings.language} />
                            <ConfigRow label="Update Frequency" value={twinSettings.updateFrequency} />
                        </div>
                    </div>

                    {/* Live Background Section */}
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wide">Live Background</p>
                        <Card>
                            <CardContent className="flex items-center justify-between p-3">
                                <span className="text-primary">Take Photo</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-3">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{value}</span>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </CardContent>
        </Card>
    )
}

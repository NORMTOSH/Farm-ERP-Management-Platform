import { useQuery } from '@tanstack/react-query'
import { getWorkers } from '@/services/workers'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateWorkerDialog } from '@/components/workers/CreateWorkerDialog'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function Workers() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const { data: workers, isLoading, error } = useQuery({
    queryKey: ['workers', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')
      const { data: members } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('profile_id', user.id)
        .limit(1)
        .single()
      
      if (!members) throw new Error('No farm membership found')
      return getWorkers(members.farm_id)
    },
    enabled: !!user?.id,
  })

  if (isLoading) return <div>Loading workers...</div>
  if (error) return <div>Error loading workers: {error.message}</div>

  const filtered = workers?.filter(w => 
    w.full_name.toLowerCase().includes(search.toLowerCase()) ||
    w.position?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
          <p className="text-muted-foreground">Manage farm workers and staff</p>
        </div>
        {workers && workers.length > 0 && (
          <CreateWorkerDialog farmId={workers[0].farm_id} />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search workers..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((worker) => (
          <Card key={worker.id}>
            <CardHeader>
              <CardTitle className="text-lg">{worker.full_name}</CardTitle>
              <CardDescription>{worker.position || 'No position'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{worker.phone || 'No phone'}</p>
              <p className="text-sm text-muted-foreground">ID: {worker.employee_id}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

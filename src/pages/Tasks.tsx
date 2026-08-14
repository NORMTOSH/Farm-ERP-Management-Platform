import { useQuery } from '@tanstack/react-query'
import { getTasks } from '@/services/tasks'
import { getWorkers as getWorkersService } from '@/services/workers'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'

const statusColors: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-purple-100 text-purple-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  resubmitted: 'bg-orange-100 text-orange-800',
}

export default function Tasks() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')
      const { data: members } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('profile_id', user.id)
        .limit(1)
        .single()
      
      if (!members) throw new Error('No farm membership found')
      return getTasks(members.farm_id)
    },
    enabled: !!user?.id,
  })

  const { data: workers } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')
      const { data: members } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('profile_id', user.id)
        .limit(1)
        .single()
      
      if (!members) throw new Error('No farm membership found')
      return getWorkersService(members.farm_id)
    },
    enabled: !!user?.id,
  })

  if (isLoading) return <div>Loading tasks...</div>
  if (error) return <div>Error loading tasks: {error.message}</div>

  const filtered = tasks?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track farm tasks</p>
        </div>
        {workers && workers.length > 0 && (
          <CreateTaskDialog farmId={workers[0].farm_id} workers={workers} />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((task) => (
          <Link key={task.id} to={`/tasks/${task.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={statusColors[task.status]}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { getTasks } from '@/services/tasks'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardList, DollarSign, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: tasks } = useQuery({
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

  const pendingTasks = tasks?.filter(t => t.status === 'assigned' || t.status === 'in_progress').length || 0
  const completedTasks = tasks?.filter(t => t.status === 'verified').length || 0
  const totalTasks = tasks?.length || 0

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks.toString(),
      change: `${pendingTasks} pending`,
      icon: ClipboardList,
    },
    {
      title: 'Completed',
      value: completedTasks.toString(),
      change: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate`,
      icon: TrendingUp,
    },
    {
      title: 'Active Workers',
      value: '—',
      change: 'Coming soon',
      icon: Users,
    },
    {
      title: 'Revenue (MTD)',
      value: '—',
      change: 'Coming soon',
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.user_metadata?.full_name || 'User'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Latest task activity across your farm</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{task.status.replace('_', ' ')}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks yet. Create your first task to get started.</p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Farm Overview</CardTitle>
            <CardDescription>Quick stats for your farm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="font-medium">{totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium">{pendingTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-medium">{completedTasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

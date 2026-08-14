import { useQuery } from '@tanstack/react-query'
import { getTask, getTaskAssignments, getTaskEvidence, getTaskVerifications, getTaskAuditLog } from '@/services/tasks'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusColors: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-purple-100 text-purple-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  resubmitted: 'bg-orange-100 text-orange-800',
}

export default function TaskDetail() {
  const { id } = useParams()

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTask(id!),
    enabled: !!id,
  })

  const { data: assignments } = useQuery({
    queryKey: ['taskAssignments', id],
    queryFn: () => getTaskAssignments(id!),
    enabled: !!id,
  })

  const { data: evidence } = useQuery({
    queryKey: ['taskEvidence', id],
    queryFn: () => getTaskEvidence(id!),
    enabled: !!id,
  })

  const { data: verifications } = useQuery({
    queryKey: ['taskVerifications', id],
    queryFn: () => getTaskVerifications(id!),
    enabled: !!id,
  })

  const { data: auditLog } = useQuery({
    queryKey: ['taskAuditLog', id],
    queryFn: () => getTaskAuditLog(id!),
    enabled: !!id,
  })

  if (taskLoading) return <div>Loading task...</div>
  if (!task) return <div>Task not found</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <p className="text-muted-foreground">Task ID: {task.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{task.description || 'No description provided'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {evidence && evidence.length > 0 ? (
                <div className="space-y-3">
                  {evidence.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="text-sm font-medium capitalize">{item.evidence_type}</p>
                        {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}
                      </div>
                      {item.storage_path && (
                        <Button variant="outline" size="sm">View</Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No evidence uploaded yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLog && auditLog.length > 0 ? (
                <div className="space-y-2">
                  {auditLog.map((log) => (
                    <div key={log.id} className="text-sm">
                      <span className="font-medium">{log.action}</span>
                      {log.old_status && <span className="text-muted-foreground"> from {log.old_status}</span>}
                      {log.new_status && <span className="text-muted-foreground"> to {log.new_status}</span>}
                      <span className="text-muted-foreground"> - {new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audit entries yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className={statusColors[task.status]}>
                {task.status.replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{task.priority}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assigned To</span>
                <span className="font-medium">{assignments?.length || 0} worker(s)</span>
              </div>
            </CardContent>
          </Card>

          {verifications && verifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {verifications.map((v) => (
                    <div key={v.id} className="text-sm">
                      <span className={`font-medium capitalize ${v.action === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                        {v.action}
                      </span>
                      {v.comment && <p className="text-muted-foreground">{v.comment}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

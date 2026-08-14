import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTask, assignTask } from '@/services/tasks'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
  worker_ids: z.array(z.string()).min(1, 'At least one worker must be assigned'),
})

type TaskFormData = z.infer<typeof taskSchema>

interface CreateTaskDialogProps {
  farmId: string
  workers: { id: string; full_name: string }[]
}

export function CreateTaskDialog({ farmId, workers }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      worker_ids: [],
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    if (!user?.id) return

    try {
      const task = await createTask({
        farm_id: farmId,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        due_date: data.due_date || null,
        created_by: user.id,
        status: 'assigned',
        deleted_at: null,
        farm_section_id: null,
        crop_id: null,
        livestock_id: null,
        equipment_id: null,
      })

      // Assign workers
      await Promise.all(
        data.worker_ids.map((workerId) => assignTask(task.id, workerId))
      )

      toast.success('Task created successfully')
      setOpen(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    } catch (error) {
      toast.error('Failed to create task')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Irrigation - Section A"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register('description')}
              placeholder="Task details..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={form.watch('priority')}
              onValueChange={(value) => form.setValue('priority', value as 'low' | 'medium' | 'high')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              {...form.register('due_date')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="worker_ids">Assign Workers</Label>
            <Select
              onValueChange={(value) => {
                const current = form.getValues('worker_ids')
                if (current.includes(value)) {
                  form.setValue('worker_ids', current.filter((id) => id !== value))
                } else {
                  form.setValue('worker_ids', [...current, value])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workers" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.watch('worker_ids').length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: {form.watch('worker_ids').length} worker(s)
              </p>
            )}
            {form.formState.errors.worker_ids && (
              <p className="text-sm text-destructive">{form.formState.errors.worker_ids.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

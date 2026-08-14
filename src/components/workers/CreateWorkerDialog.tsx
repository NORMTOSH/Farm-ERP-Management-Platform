import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWorker } from '@/services/workers'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

const workerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  employee_id: z.string().min(1, 'Employee ID is required'),
  phone: z.string().optional(),
  position: z.string().optional(),
  hire_date: z.string().optional(),
})

type WorkerFormData = z.infer<typeof workerSchema>

interface CreateWorkerDialogProps {
  farmId: string
}

export function CreateWorkerDialog({ farmId }: CreateWorkerDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      full_name: '',
      employee_id: '',
      phone: '',
      position: '',
      hire_date: '',
    },
  })

  const onSubmit = async (data: WorkerFormData) => {
    try {
      await createWorker({
        farm_id: farmId,
        employee_id: data.employee_id,
        full_name: data.full_name,
        phone: data.phone || null,
        position: data.position || null,
        hire_date: data.hire_date || null,
        profile_id: null,
        deleted_at: null,
      })
      
      toast.success('Worker added successfully')
      setOpen(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['workers'] })
    } catch (error) {
      toast.error('Failed to add worker')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Worker</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...form.register('full_name')}
              placeholder="John Kamau"
            />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee ID</Label>
            <Input
              id="employee_id"
              {...form.register('employee_id')}
              placeholder="EMP-001"
            />
            {form.formState.errors.employee_id && (
              <p className="text-sm text-destructive">{form.formState.errors.employee_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+254 712 345 678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              {...form.register('position')}
              placeholder="Field Worker"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
              id="hire_date"
              type="date"
              {...form.register('hire_date')}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Adding...' : 'Add Worker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

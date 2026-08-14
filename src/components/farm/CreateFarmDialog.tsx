import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFarm } from '@/services/farms'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

const farmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
})

type FarmFormData = z.infer<typeof farmSchema>

export function CreateFarmDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const form = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
    },
  })

  const onSubmit = async (data: FarmFormData) => {
    if (!user?.id) return

    try {
      await createFarm({
        name: data.name,
        description: data.description || null,
        location: data.location || null,
        owner_id: user.id,
        deleted_at: null,
      })
      
      toast.success('Farm created successfully')
      setOpen(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['farms'] })
    } catch (error) {
      toast.error('Failed to create farm')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Farm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Farm</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Farm Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Green Valley Farm"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="Nakuru, Kenya"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register('description')}
              placeholder="Brief description of the farm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Farm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

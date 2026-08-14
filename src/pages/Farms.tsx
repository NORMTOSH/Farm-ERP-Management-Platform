import { useQuery } from '@tanstack/react-query'
import { getFarms } from '@/services/farms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateFarmDialog } from '@/components/farm/CreateFarmDialog'

export default function Farms() {
  const { data: farms, isLoading, error } = useQuery({
    queryKey: ['farms'],
    queryFn: getFarms,
  })

  if (isLoading) return <div>Loading farms...</div>
  if (error) return <div>Error loading farms: {error.message}</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farms</h1>
          <p className="text-muted-foreground">Manage your farm locations</p>
        </div>
        <CreateFarmDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {farms?.map((farm) => (
          <Card key={farm.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{farm.name}</CardTitle>
              <CardDescription>{farm.location || 'No location set'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Created {new Date(farm.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

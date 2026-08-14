import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  process.env.VITE_SUPABASE_ANON_KEY || 'anon-key'
)

async function seed() {
  console.log('🌱 Seeding database...')

  // Create a test user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'owner@farm.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Farm Owner' },
  })

  if (authError) {
    console.error('Error creating user:', authError.message)
    return
  }

  const userId = authData.user.id
  console.log('✅ Created user:', userId)

  // Create a farm
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .insert({
      name: 'Green Valley Farm',
      description: 'A demonstration farm for testing',
      location: 'Nakuru, Kenya',
      owner_id: userId,
    })
    .select()
    .single()

  if (farmError) {
    console.error('Error creating farm:', farmError.message)
    return
  }

  console.log('✅ Created farm:', farm.id)

  // Add owner as farm member
  const { error: memberError } = await supabase
    .from('farm_members')
    .insert({
      farm_id: farm.id,
      profile_id: userId,
      role: 'owner',
    })

  if (memberError) {
    console.error('Error adding farm member:', memberError.message)
    return
  }

  console.log('✅ Added farm owner')

  // Create workers
  const workers = [
    { employee_id: 'EMP-001', full_name: 'John Kamau', phone: '+254 712 345 678', position: 'Farm Manager' },
    { employee_id: 'EMP-002', full_name: 'Mary Wanjiku', phone: '+254 723 456 789', position: 'Field Worker' },
    { employee_id: 'EMP-003', full_name: 'Peter Mwangi', phone: '+254 734 567 890', position: 'Driver' },
  ]

  const createdWorkers = []
  for (const worker of workers) {
    const { data, error } = await supabase
      .from('workers')
      .insert({
        farm_id: farm.id,
        ...worker,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating worker:', error.message)
      continue
    }

    createdWorkers.push(data)
    console.log(`✅ Created worker: ${data.full_name}`)

    // Add workers as farm members
    await supabase
      .from('farm_members')
      .insert({
        farm_id: farm.id,
        profile_id: userId, // In production, each worker would have their own profile
        role: 'worker',
      })
  }

  // Create sample tasks
  const tasks = [
    { title: 'Irrigation - Section A', description: 'Complete irrigation for the tomato crop', priority: 'high' },
    { title: 'Harvest Tomatoes - Greenhouse 2', description: 'Harvest ripe tomatoes', priority: 'medium' },
    { title: 'Fertilizer Application - Plot 5', description: 'Apply NPK fertilizer', priority: 'low' },
  ]

  for (const task of tasks) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        farm_id: farm.id,
        created_by: userId,
        ...task,
        status: 'assigned',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error.message)
      continue
    }

    console.log(`✅ Created task: ${data.title}`)

    // Assign to random worker
    if (createdWorkers.length > 0) {
      const randomWorker = createdWorkers[Math.floor(Math.random() * createdWorkers.length)]
      await supabase
        .from('task_assignments')
        .insert({
          task_id: data.id,
          worker_id: randomWorker.id,
        })
      console.log(`  └─ Assigned to: ${randomWorker.full_name}`)
    }
  }

  console.log('\n🎉 Seed completed!')
  console.log('\nYou can now log in with:')
  console.log('  Email: owner@farm.com')
  console.log('  Password: password123')
}

seed().catch(console.error)

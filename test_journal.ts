import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
  if (userError || !userData.users.length) return console.error('No users found', userError)
  
  const userId = userData.users[0].id
  
  const { data, error } = await supabase
    .from('journal_entries')
    .upsert({
      user_id: userId,
      entry_date: '2026-08-10',
      content: 'test content',
      mood: 4,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, entry_date' })

  if (error) console.error('Upsert Error:', error)
  else console.log('Successfully upserted journal entry.')
}

run()

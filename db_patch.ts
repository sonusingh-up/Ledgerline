import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const { data, error } = await supabase
    .from('accounts')
    .update({ start_balance: 100000 })
    .eq('label', 'FTMO 100K')

  if (error) console.error(error)
  else console.log('Successfully updated FTMO 100K to $100,000 starting balance.')
}

run()

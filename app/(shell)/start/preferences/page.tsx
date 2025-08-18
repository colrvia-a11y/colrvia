export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import StartPreferencesClient from './StartPreferencesClient'

export default function StartPreferencesPage(){
  return (
    <Suspense fallback={null}>
      <StartPreferencesClient />
    </Suspense>
  )
}

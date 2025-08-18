export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import SignInClient from './SignInClient'

export default function SignInPage(){
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  )
}

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Le CSS neutralise déjà transitions et animations. Ce hook sert au seul cas
 * que le CSS ne couvre pas : le chrono, dessiné frame par frame en JavaScript,
 * qui doit alors avancer par paliers d'une seconde plutôt qu'en continu.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia(QUERY).matches,
  )

  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mql = matchMedia(QUERY)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}

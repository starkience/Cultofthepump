import { useEffect, useState } from 'react'

export function useNow(timeInterval = 1000) {
  const [now, setNow] = useState(Date.now())

  // update now every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, timeInterval)

    return () => clearInterval(interval)
  }, [timeInterval])

  return now
}

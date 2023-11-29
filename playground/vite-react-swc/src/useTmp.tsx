import { useState } from 'react'

export default function useTmp() {
  const [tmp, setTmp] = useState(1)
  return {
    tmp,
    setTmp,
  }
}

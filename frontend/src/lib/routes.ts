export const dashboardPath = () => {
  return '/'
}

export const pickPath = (challengeId?: string) => {
  if (challengeId) {
    return `/pick/${challengeId}`
  }

  return '/pick'
}

export const sharePath = (challengeId: string) => {
  return `/share/${challengeId}`
}

export const drawPath = (challengeId: string) => {
  return `/draw/${challengeId}`
}

export const guessPath = (challengeId: string) => {
  return `/guess/${challengeId}`
}

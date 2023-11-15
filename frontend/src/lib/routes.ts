export const dashboardPath = () => {
  return '/dashboard'
}

export const pickPath = (challengeId?: string) => {
  if (challengeId) {
    return `/${challengeId}`
  }

  return '/'
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

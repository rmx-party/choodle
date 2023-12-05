export const dashboardPath = () => {
  return "/dashboard";
};

export const pickPath = (challengeId?: number) => {
  if (challengeId) {
    return `/${challengeId}`;
  }

  return "/";
};

export const sharePath = (challengeId: number) => {
  return `/share/${challengeId}`;
};

export const drawPath = (challengeId: number) => {
  return `/draw/${challengeId}`;
};

export const guessPath = (challengeId: number) => {
  return `/guess/${challengeId}`;
};

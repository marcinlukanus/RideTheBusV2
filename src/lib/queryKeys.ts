export const queryKeys = {
  cardCounts: ['cardCounts'] as const,
  dailySeed: ['dailySeed'] as const,
  profile: (username: string) => ['profile', username] as const,
  userScores: (userId: string) => ['userScores', userId] as const,
  userBeerdleStats: (userId: string) => ['userBeerdleStats', userId] as const,
  todayBeerdleScore: (userId: string) => ['todayBeerdleScore', userId] as const,
  longestRides: ['longestRides'] as const,
  medalTable: ['medalTable'] as const,
  profileById: (userId: string) => ['profileById', userId] as const,
};

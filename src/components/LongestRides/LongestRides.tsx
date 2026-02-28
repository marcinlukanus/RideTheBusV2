import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDailyWorstScores, getDailyWorstScoresByCountry } from '../../api/getDailyWorstScores';
import { getProfileById } from '../../api/getProfileById';
import { Panel } from '../ui/Panel';
import { useAuth } from '../../contexts/AuthContext';
import { queryKeys } from '../../lib/queryKeys';
import { getFlagEmoji } from '../../utils/countries';

export const LongestRides = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'global' | 'country'>('global');

  const { data: currentProfile } = useQuery({
    queryKey: queryKeys.profileById(user?.id ?? ''),
    queryFn: () => getProfileById(user!.id),
    enabled: !!user?.id,
  });

  const userCountry = currentProfile?.country ?? null;
  const canFilterByCountry = !!user && !!userCountry;

  const { data: globalScores = [] } = useQuery({
    queryKey: queryKeys.longestRides,
    queryFn: getDailyWorstScores,
  });

  const { data: countryScores = [] } = useQuery({
    queryKey: queryKeys.longestRidesByCountry(userCountry ?? ''),
    queryFn: () => getDailyWorstScoresByCountry(userCountry!),
    enabled: canFilterByCountry && filter === 'country',
  });

  const scores = filter === 'country' && canFilterByCountry ? countryScores : globalScores;
  const worstScore = scores.length > 0 ? scores[0].score : 0;
  const hasScores = scores.length > 0;

  return (
    <Panel className="mx-auto flex max-w-[600px] min-w-[300px] flex-col gap-4">
      <div>
        <p className="text-center text-2xl font-bold">Longest Rides</p>
        <p className="text-center italic">Past 24 hours</p>
      </div>

      {canFilterByCountry && (
        <div className="flex justify-center gap-1 rounded-lg bg-gray-700 p-1">
          <button
            className={`flex-1 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              filter === 'global'
                ? 'bg-gray-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setFilter('global')}
          >
            Global
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              filter === 'country'
                ? 'bg-gray-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setFilter('country')}
          >
            {getFlagEmoji(userCountry)} My Country
          </button>
        </div>
      )}

      {!hasScores && <p>No rides taken...</p>}

      <ul>
        {scores.map((entry, index) => (
          <li
            key={index}
            className="align-center mb-2.5 flex items-center gap-2 rounded-md bg-sky-200 p-2.5 transition-all duration-300"
            style={{
              width: `${(entry.score / worstScore) * 100}%`,
            }}
          >
            {entry.country && (
              <span className="text-base leading-none">{getFlagEmoji(entry.country)}</span>
            )}
            <span className="font-bold text-slate-800">{entry.score}</span>
            {entry.username && (
              <span className="truncate text-xs text-slate-600">{entry.username}</span>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
};

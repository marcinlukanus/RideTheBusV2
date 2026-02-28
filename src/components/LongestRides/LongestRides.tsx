import { useQuery } from '@tanstack/react-query';
import { getDailyWorstScores } from '../../api/getDailyWorstScores';
import { Panel } from '../ui/Panel';
import { queryKeys } from '../../lib/queryKeys';
import { getFlagEmoji } from '../../utils/countries';

export const LongestRides = () => {
  const { data: scores = [] } = useQuery({
    queryKey: queryKeys.longestRides,
    queryFn: getDailyWorstScores,
  });

  const worstScore = scores.length > 0 ? scores[0].score : 0;
  const hasScores = scores.length > 0;

  return (
    <Panel className="mx-auto flex max-w-[600px] min-w-[300px] flex-col gap-4">
      <div>
        <p className="text-center text-2xl font-bold">Longest Rides</p>
        <p className="text-center italic">Past 24 hours</p>
      </div>

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
            <span className="font-bold text-slate-800">{entry.score}</span>
            {entry.country && (
              <span className="text-base leading-none">{getFlagEmoji(entry.country)}</span>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
};

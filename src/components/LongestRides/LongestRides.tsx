import { useState, useEffect } from 'react';
import { getDailyWorstScores } from '../../api/getDailyWorstScores';
import { Panel } from '../ui/Panel';

export const LongestRides = () => {
  const [worstScores, setWorstScores] = useState<{ score: number }[]>([]);

  useEffect(() => {
    const fetchWorstScores = async () => {
      const data = await getDailyWorstScores();
      setWorstScores(data);
    };

    void fetchWorstScores();
  }, []);

  const worstScore = worstScores.length > 0 ? worstScores[0].score : 0;

  const hasScores = worstScores.length > 0;

  return (
    <Panel className="mx-auto flex max-w-[600px] min-w-[300px] flex-col gap-4">
      <div>
        <p className="text-center text-2xl font-bold">Longest Rides</p>
        <p className="text-center italic">Past 24 hours</p>
      </div>

      {!hasScores && <p>No rides taken...</p>}

      <ul>
        {worstScores.map((score, index) => (
          <li
            key={index}
            className="align-center mb-2.5 flex rounded-md bg-sky-200 p-2.5 transition-all duration-300"
            style={{
              width: `${(score.score / worstScore) * 100}%`,
            }}
          >
            <span className="font-bold text-slate-800">{score.score}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

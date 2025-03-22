import { useState, useEffect } from 'react';
import { getDailyWorstScores } from '../../api/getDailyWorstScores';

export const LongestRides = () => {
  const [worstScores, setWorstScores] = useState<any[]>([]);

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
    <div className="mx-auto flex max-w-[600px] min-w-[300px] flex-col gap-4 rounded-lg border-1 border-black bg-[#1a2531] p-5 shadow-md">
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
    </div>
  );
};

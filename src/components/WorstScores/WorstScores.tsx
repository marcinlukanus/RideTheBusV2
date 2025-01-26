import { useState, useEffect } from 'react';
import { getDailyWorstScores } from '../../api/getDailyWorstScores';

export const WorstScores = () => {
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
    <div
      className='flex flex-col gap-4 max-w-[600px] min-w-[300px] mx-auto p-5 border-1 border-black rounded-lg
    bg-[#1a2531] shadow-md'
    >
      <div>
        <p className='text-center font-bold text-2xl'>Longest Rides</p>
        <p className='text-center italic'>Past 24 hours</p>
      </div>

      {!hasScores && <p>No rides taken...</p>}

      <ul>
        {worstScores.map((score, index) => (
          <li
            key={index}
            className='flex align-center bg-sky-200 mb-2.5 p-2.5 transition-all duration-300 rounded-md'
            style={{
              width: `${(score.score / worstScore) * 100}%`,
            }}
          >
            <span className='font-bold text-slate-800'>{score.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

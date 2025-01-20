import { useState, useEffect } from 'react';
import { getDailyWorstScores } from '../../api/getDailyWorstScores';
import './WorstScores.css';

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

  return (
    <div className='worst-scores'>
      <div>
        <p className='score-type'>Longest Rides</p>
        <p className='score-time'>Past 24 hours</p>
      </div>

      <ul>
        {worstScores.map((score, index) => (
          <li
            key={index}
            style={{
              width: `${(score.score / worstScore) * 100}%`,
            }}
          >
            <span>{score.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

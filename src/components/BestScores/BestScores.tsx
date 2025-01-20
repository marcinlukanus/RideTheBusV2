import { useState, useEffect } from 'react';
import { getDailyBestScores } from '../../api/getDailyBestScores';
import './BestScores.css';

export const BestScores = () => {
  const [bestScores, setBestScores] = useState<any[]>([]);

  useEffect(() => {
    const fetchBestScores = async () => {
      const data = await getDailyBestScores();
      setBestScores(data);
    };

    void fetchBestScores();
  }, []);

  const bestScore = bestScores.length > 0 ? bestScores[0].score : 0;

  return (
    <div className='best-scores'>
      <div>
        <p className='score-type'>Shortest Rides</p>
        <p className='score-time'>(Past 24 hours)</p>
      </div>

      <ul>
        {bestScores.map((score, index) => (
          <li
            key={index}
            style={{
              width: `${((bestScore || 1) * 100) / score.score}%`,
            }}
          >
            <span>{score.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

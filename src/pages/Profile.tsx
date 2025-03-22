import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByDisplayName } from '../api/getUserByDisplayName';
import { getUserScores } from '../api/getUserScores';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Score = Database['public']['Tables']['scores']['Row'];

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!username) {
          throw new Error(
            "What is this, a profile page without a username? That's like a horse without a... actually, never mind."
          );
        }

        const userData = await getUserByDisplayName(username);
        setProfile(userData);

        const userScores = await getUserScores(userData.id);
        setScores(
          userScores.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-xl'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-xl text-red-500'>{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-xl'>
          User not found. Back in the 90s, this would&apos;ve been a 404 page...
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>
        {profile.username}&apos;s Profile
      </h1>

      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <table className='min-w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Score
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {scores.map((score) => (
              <tr key={score.id}>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {new Date(score.created_at).toLocaleDateString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {score.score}
                </td>
              </tr>
            ))}
            {scores.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className='px-6 py-4 text-center text-sm text-gray-500'
                >
                  No scores yet. What is this, a scoring drought? That&apos;s
                  worse than my acting career in 2007!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserByDisplayName } from '../api/getUserByDisplayName';
import { getUserScores } from '../api/getUserScores';
import { Database } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import { uploadAvatar } from '../utils/supabase';
import supabase from '../utils/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Score = Database['public']['Tables']['scores']['Row'];

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = user?.id === profile?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!username) {
          throw new Error(
            "What is this, a profile page without a username? That's like a horse without a... actually, never mind.",
          );
        }

        const userData = await getUserByDisplayName(username);
        setProfile(userData);

        const userScores = await getUserScores(userData.id);
        setScores(
          userScores.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUpdating(true);
    try {
      const { publicUrl } = await uploadAvatar(file, profile.id);

      // Update the profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    // Redirect to home page
    navigate('/');
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">
          User not found. Back in the 90s, this would&apos;ve been a 404 page...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-center">
        <div
          className={`relative mb-4 h-32 w-32 ${isOwnProfile ? 'group cursor-pointer' : ''}`}
          onClick={handleAvatarClick}
        >
          <img
            src={profile.avatar_url || '/images/default-avatar.png'}
            alt={`${profile.username}'s avatar`}
            className="h-32 w-32 rounded-full border-4 border-gray-200 object-cover dark:border-gray-700"
          />
          {isOwnProfile && (
            <>
              <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-sm text-white">
                  {updating ? 'Updating...' : 'Change Avatar'}
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={updating}
              />
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold">{profile.username}</h1>
        {/* Display this h3 only if the profile.created_at is before March 24, 2025 local TZ */}
        {new Date(profile.created_at) < new Date('2025-03-24T00:00:00') && (
          <h3 className="mt-2 text-xl italic">Founding Bus Rider 🍻</h3>
        )}
      </div>

      <table className="mx-auto w-full max-w-2xl">
        <thead>
          <tr>
            <th className="border-b px-4 py-2">Ticket Date</th>
            <th className="border-b px-4 py-2">Stops</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.id}>
              <td className="border-b px-4 py-2">
                {new Date(score.created_at).toLocaleDateString()}
              </td>
              <td className="border-b px-4 py-2">{score.score}</td>
            </tr>
          ))}
          {scores.length === 0 && (
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-300">
                No rides taken yet. Lame!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

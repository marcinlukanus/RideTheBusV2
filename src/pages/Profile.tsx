import { useRef, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfileByUsername } from '../api/getProfileByUsername';
import { getUserScores } from '../api/getUserScores';
import { getUserBeerdleStats } from '../api/getUserBeerdleStats';
import { Database } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../utils/supabase';
import { uploadAvatar } from '../api/uploadAvatar';
import { queryClient } from '../lib/queryClient';
import { queryKeys } from '../lib/queryKeys';
import { COUNTRIES, getFlagEmoji, getCountryName } from '../utils/countries';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Score = Database['public']['Tables']['scores']['Row'];

export const Profile = () => {
  const { username } = useParams({ strict: false }) as { username: string };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile>({
    queryKey: queryKeys.profile(username!),
    queryFn: () => getProfileByUsername(username!),
    enabled: !!username,
  });

  const { data: scores = [] } = useQuery<Score[]>({
    queryKey: queryKeys.userScores(profile?.id ?? ''),
    queryFn: () => getUserScores(profile!.id),
    enabled: !!profile?.id,
    select: (data) =>
      [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
  });

  const { data: beerdleStats = null } = useQuery({
    queryKey: queryKeys.userBeerdleStats(profile?.id ?? ''),
    queryFn: () => getUserBeerdleStats(profile!.id),
    enabled: !!profile?.id,
  });

  const avatarMutation = useMutation({
    mutationFn: async ({ file, profileId }: { file: File; profileId: string }) => {
      if (!user || user.id !== profileId) {
        throw new Error('You can only update your own avatar');
      }
      const { publicUrl } = await uploadAvatar(file, profileId);
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);
      if (error) throw error;
      return publicUrl;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile(username!) }),
  });

  const countryMutation = useMutation({
    mutationFn: async (country: string | null) => {
      const { error } = await supabase
        .from('profiles')
        .update({ country })
        .eq('id', profile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(username!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileById(user!.id) });
      setShowCountryPicker(false);
      setCountrySearch('');
    },
  });

  const confettiMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('profiles')
        .update({ country_confetti: enabled })
        .eq('id', profile!.id);
      if (error) throw error;
    },
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile(username!) });
      const previous = queryClient.getQueryData(queryKeys.profile(username!));
      queryClient.setQueryData(queryKeys.profile(username!), (old: Profile) => ({
        ...old,
        country_confetti: enabled,
      }));
      return { previous };
    },
    onError: (_err, _enabled, context) => {
      queryClient.setQueryData(queryKeys.profile(username!), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(username!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileById(user!.id) });
    },
  });

  const isOwnProfile = user?.id === profile?.id;

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    avatarMutation.mutate({ file, profileId: profile.id });
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const wins = scores.filter((s) => s.score === 0).length;
  const avgDrinks =
    scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
      : null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    navigate({ to: '/' });
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
                  {avatarMutation.isPending ? 'Updating...' : 'Change Avatar'}
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={avatarMutation.isPending}
              />
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold">{profile.username}</h1>

        {/* Founding Bus Rider badge */}
        {new Date(profile.created_at) < new Date('2025-03-24T00:00:00') && (
          <h3 className="mt-2 text-xl italic">Founding Bus Rider 🍻</h3>
        )}

        {/* Country badge */}
        {profile.country && (
          <p className="mt-1 text-lg">
            Drinking for {getFlagEmoji(profile.country)} {getCountryName(profile.country)}
          </p>
        )}

        {/* Stats summary */}
        {scores.length > 0 && (
          <div className="mt-3 flex gap-4 text-sm text-gray-400">
            <span>{wins} win{wins !== 1 ? 's' : ''}</span>
            {avgDrinks !== null && <span>{avgDrinks} avg drinks</span>}
          </div>
        )}

        {/* Country picker + confetti toggle for own profile */}
        {isOwnProfile && (
          <div className="mt-4 w-full max-w-xs">
            {!showCountryPicker ? (
              <button
                className="w-full rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
                onClick={() => setShowCountryPicker(true)}
              >
                {profile.country
                  ? `${getFlagEmoji(profile.country)} ${getCountryName(profile.country)} — Change`
                  : '🌍 Set your country'}
              </button>
            ) : (
              <div className="rounded-md border border-gray-600 bg-gray-800">
                <div className="flex items-center gap-2 border-b border-gray-600 p-2">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    autoFocus
                  />
                  <button
                    className="text-xs text-gray-400 hover:text-white"
                    onClick={() => {
                      setShowCountryPicker(false);
                      setCountrySearch('');
                    }}
                  >
                    ✕
                  </button>
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {profile.country && (
                    <li>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                        onClick={() => countryMutation.mutate(null)}
                        disabled={countryMutation.isPending}
                      >
                        Remove country
                      </button>
                    </li>
                  )}
                  {filteredCountries.map((country) => (
                    <li key={country.code}>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
                        onClick={() => countryMutation.mutate(country.code)}
                        disabled={countryMutation.isPending}
                      >
                        {country.flag} {country.name}
                      </button>
                    </li>
                  ))}
                  {filteredCountries.length === 0 && (
                    <li className="px-3 py-2 text-sm text-gray-500">No countries found</li>
                  )}
                </ul>
              </div>
            )}
          {profile.country && (
            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-300">
              <span className="text-balance">🎊 Country-color confetti on perfect rides</span>
              <input
                type="checkbox"
                className="ml-3 h-4 w-4"
                style={{ accentColor: '#d97706' }}
                checked={profile.country_confetti}
                disabled={confettiMutation.isPending}
                onChange={(e) => confettiMutation.mutate(e.target.checked)}
              />
            </label>
          )}
          </div>
        )}
      </div>

      {/* Beerdle Stats Section */}
      {beerdleStats && beerdleStats.totalGames > 0 && (
        <div className="mx-auto mb-8 w-full max-w-2xl">
          <h2 className="mb-4 text-2xl font-bold text-amber-400">🍺 Beerdle Stats</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{beerdleStats.totalGames}</p>
              <p className="text-sm text-gray-400">Games Played</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{beerdleStats.bestScore}</p>
              <p className="text-sm text-gray-400">Best Score</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{beerdleStats.averageScore}</p>
              <p className="text-sm text-gray-400">Avg Score</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">
                {beerdleStats.currentStreak}
                {beerdleStats.currentStreak > 0 && ' 🔥'}
              </p>
              <p className="text-sm text-gray-400">Current Streak</p>
            </div>
          </div>
          {beerdleStats.longestStreak > 0 && (
            <p className="mt-2 text-center text-sm text-gray-400">
              Longest streak: {beerdleStats.longestStreak} day
              {beerdleStats.longestStreak !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      <h2 className="mb-4 text-2xl font-bold">🚌 Ride The Bus Scores</h2>
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

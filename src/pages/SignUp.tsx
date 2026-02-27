import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import supabase from '../utils/supabase';
import type { Database } from '../types/database.types';
import { uploadAvatar } from '../api/uploadAvatar';
import { Button } from '../components/ui/Button';

type Profile = Database['public']['Tables']['profiles']['Insert'];

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('/images/default-avatar.png');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validationResult = signUpSchema.safeParse({ username, email, password });

    if (!validationResult.success) {
      setError(validationResult.error.errors.map((err) => err.message).join(', '));
      setLoading(false);
      return;
    }

    try {
      // Sign up the user - this will also automatically sign them in
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError || !data.user) throw signUpError;

      // Upload avatar if one was selected
      let avatarUrl = '/images/default-avatar.png';
      if (avatarFile) {
        const { publicUrl } = await uploadAvatar(avatarFile, data.user.id);
        avatarUrl = publicUrl;
      }

      // Create a new profile in the database
      const profile: Profile = {
        id: data.user.id,
        username,
        avatar_url: avatarUrl,
      };

      const { error: profileError } = await supabase.from('profiles').insert([profile]);

      if (profileError) throw profileError;

      // User is already logged in thanks to Supabase's auto-login after signup
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-20 sm:px-6 lg:px-8">
      <title>Sign Up – Ride The Bus</title>
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href="https://ridethebus.party/sign-up" />
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="group relative mb-4 h-32 w-32 cursor-pointer" onClick={handleAvatarClick}>
            <img
              src={avatarPreview}
              alt="Profile avatar"
              className="h-32 w-32 rounded-full border-4 border-gray-200 object-cover dark:border-gray-700"
            />
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-sm text-white">Change Avatar</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
            >
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-left text-sm text-red-500">{error}</div>}

          <div>
            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
              className="w-full justify-center text-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

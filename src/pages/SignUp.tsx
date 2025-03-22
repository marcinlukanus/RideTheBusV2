import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase, { uploadAvatar } from '../utils/supabase';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Insert'];

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(
    '/images/default-avatar.png'
  );
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

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profile]);

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
    <div className='min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-20'>
      <div className='max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl'>
        <div className='flex flex-col items-center'>
          <div
            className='relative w-32 h-32 mb-4 cursor-pointer group'
            onClick={handleAvatarClick}
          >
            <img
              src={avatarPreview}
              alt='Profile avatar'
              className='w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700'
            />
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
              <span className='text-white text-sm'>Change Avatar</span>
            </div>
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              accept='image/*'
              onChange={handleAvatarChange}
            />
          </div>
          <h2 className='text-3xl font-extrabold text-gray-900 dark:text-white'>
            Create your account
          </h2>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Or{' '}
            <Link
              to='/login'
              className='font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300'
            >
              sign in to your account
            </Link>
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left'
              >
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                autoComplete='username'
                required
                className='appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700'
                placeholder='Choose a username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left'
              >
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left'
              >
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                className='appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700'
                placeholder='Create a password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className='text-red-500 text-sm text-left'>{error}</div>
          )}

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

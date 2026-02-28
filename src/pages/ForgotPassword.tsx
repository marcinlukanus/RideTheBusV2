import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import supabase from '../utils/supabase';
import { Button } from '../components/ui/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-start justify-center px-4 pt-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Check your email</h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              We sent a password reset link to <span className="font-medium text-gray-900 dark:text-white">{email}</span>.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Check your spam folder if it doesn&apos;t show up in a minute.
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-20 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

          {error && <div className="text-left text-sm text-red-500">{error}</div>}

          <div>
            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
              className="w-full justify-center text-sm"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

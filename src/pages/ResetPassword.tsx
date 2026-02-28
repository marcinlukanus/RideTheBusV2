import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import supabase from '../utils/supabase';
import { Button } from '../components/ui/Button';

type TokenStatus = 'checking' | 'valid' | 'invalid';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenStatus('valid');
      }
    });

    // If no PASSWORD_RECOVERY event fires within 3s, the link is invalid/expired
    const timeout = setTimeout(() => {
      setTokenStatus((prev) => (prev === 'checking' ? 'invalid' : prev));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate({ to: '/' }), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-start justify-center px-4 pt-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Password updated!</h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your password has been reset. Redirecting you home...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-start justify-center px-4 pt-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="flex min-h-screen items-start justify-center px-4 pt-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Link expired</h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Request a new link
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
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Set new password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Choose a new password for your account.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

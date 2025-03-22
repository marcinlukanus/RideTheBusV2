import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="mt-4 pb-4 shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <picture>
                <img src="/images/logo/144.png" alt="Ride The Bus Logo" className="h-16 w-auto" />
              </picture>
              <span className="xs:inline ml-2 hidden text-xl font-bold text-white">
                Ride The Bus
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:cursor-pointer hover:text-gray-900 focus:outline-none dark:text-gray-300 dark:hover:text-white"
                >
                  <img
                    src={profile?.avatar_url || '/images/default-avatar.png'}
                    alt="Profile avatar"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="text-md xs:inline font-medium">
                    {profile?.username || user.user_metadata?.display_name}
                  </span>
                  <svg
                    className={`-mt-0.5 h-5 w-5 transform transition-transform duration-200 ${isMenuOpen ? 'translate-y-1 rotate-180' : 'translate-y-1'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="ring-opacity-5 absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black dark:bg-gray-800">
                    <div className="py-1">
                      <Link
                        to={`/${profile?.username || user.user_metadata.display_name}/profile`}
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/sign-up"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

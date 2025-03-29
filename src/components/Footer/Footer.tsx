import { Link } from 'react-router-dom';

export const Footer = (): JSX.Element => {
  return (
    <footer className="mt-4 pb-4">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center px-4 sm:h-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="mb-2 flex items-center justify-center md:mb-0">
          <Link to="/" className="flex items-center justify-center">
            <picture>
              <img src="/images/logo/144.png" alt="Ride The Bus Logo" className="h-16 w-auto" />
            </picture>
            <span className="xs:inline ml-2 text-xl font-bold text-white">Ride The Bus</span>
          </Link>
        </div>

        <div className="mb-2 flex items-center justify-center md:mb-0">
          <p className="text-xs">Coded with 🍻 by Marcin Lukanus</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="xs:flex-row flex flex-col space-y-2 sm:space-y-0 sm:space-x-4">
            <Link
              to="/"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/stats"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Stats
            </Link>
            <Link
              to="/party-bus"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Party Bus
            </Link>
            <a
              className="mb-2 flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 sm:mb-0 dark:text-gray-300 dark:hover:text-white"
              href="https://buymeacoffee.com/ridethebus"
              target="_blank"
              rel="noreferrer"
            >
              Buy me a beer!
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

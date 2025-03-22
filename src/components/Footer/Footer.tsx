import { Link } from 'react-router-dom';

export const Footer = (): JSX.Element => {
  return (
    <footer className="flex h-16 items-center justify-center bg-black text-white">
      <span>Created by Marcin Lukanus</span>

      <span className="mx-2">|</span>

      <Link to="/">Home</Link>

      <span className="mx-2">|</span>

      <Link to="/stats">Stats</Link>

      <span className="mx-2">|</span>

      <a href="https://github.com/marcinlukanus/RideTheBusV2" target="_blank" rel="noreferrer">
        GitHub
      </a>

      <span className="mx-2">|</span>

      <a href="https://buymeacoffee.com/ridethebus" target="_blank" rel="noreferrer">
        Buy me a beer!
      </a>
    </footer>
  );
};

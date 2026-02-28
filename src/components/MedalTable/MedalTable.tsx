import { useQuery } from '@tanstack/react-query';
import { getMedalTable } from '../../api/getMedalTable';
import { Panel } from '../ui/Panel';
import { queryKeys } from '../../lib/queryKeys';
import { getFlagEmoji, getCountryName } from '../../utils/countries';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from '@tanstack/react-router';

const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

export const MedalTable = () => {
  const { user } = useAuth();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: queryKeys.medalTable,
    queryFn: getMedalTable,
  });

  return (
    <Panel className="mx-auto flex max-w-[600px] min-w-[300px] flex-col gap-4">
      <div>
        <p className="text-center text-2xl font-bold">Medal Table</p>
        <p className="text-center italic">Past 24 hours</p>
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading...</p>}

      {!isLoading && rows.length === 0 && (
        <p className="text-sm text-gray-400">No perfect rides yet today. Be the first!</p>
      )}

      {!user && (
        <div className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-center text-sm">
          <p className="text-white">🍺 Drink for your country!</p>
          <p className="mt-1 text-gray-400">
            <Link to="/sign-up" className="text-sky-400 hover:underline">Sign up</Link>
            {' '}to start drinking for your nation
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="pb-2 pr-3 font-normal">#</th>
              <th className="pb-2 pr-3 font-normal">Country</th>
              <th className="pb-2 pr-3 text-right font-normal">Perfect Rides</th>
              <th className="pb-2 text-right font-normal">Avg Drinks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.country} className="border-t border-gray-700">
                <td className="py-2 pr-3 text-lg">
                  {MEDAL_ICONS[index] ?? `${index + 1}`}
                </td>
                <td className="py-2 pr-3">
                  <span className="mr-1">{getFlagEmoji(row.country)}</span>
                  {getCountryName(row.country) || row.country}
                </td>
                <td className="py-2 pr-3 text-right font-bold text-amber-400">
                  {row.wins}
                </td>
                <td className="py-2 text-right text-gray-300">{row.avg_drinks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
};

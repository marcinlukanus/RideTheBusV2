import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMedalTable } from '../../api/getMedalTable';
import { Panel } from '../ui/Panel';
import { queryKeys } from '../../lib/queryKeys';
import { getFlagEmoji, getCountryName } from '../../utils/countries';

const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

export const MedalTable = () => {
  const [open, setOpen] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: queryKeys.medalTable,
    queryFn: getMedalTable,
    enabled: open,
  });

  return (
    <Panel className="mx-auto flex max-w-[600px] min-w-[300px] flex-col gap-3">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div>
          <p className="text-2xl font-bold">Medal Table</p>
          <p className="italic text-gray-400">Perfect rides by country (24h)</p>
        </div>
        <span className="text-xl text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div>
          {isLoading && <p className="text-sm text-gray-400">Loading...</p>}

          {!isLoading && rows.length === 0 && (
            <p className="text-sm text-gray-400">No perfect rides yet today. Be the first!</p>
          )}

          {rows.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="pb-2 pr-3 font-normal">#</th>
                  <th className="pb-2 pr-3 font-normal">Country</th>
                  <th className="pb-2 pr-3 text-right font-normal">Perfect Wins</th>
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
        </div>
      )}
    </Panel>
  );
};

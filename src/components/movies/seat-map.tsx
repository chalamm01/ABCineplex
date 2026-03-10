import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { DemandBadge } from '@/components/movies/date-time-selection';

type SeatStatus = 'available' | 'reserved' | 'selected' | 'locked';

interface Seat {
  id?: number;
  row: string;
  col: number;
  status: SeatStatus;
  price?: number;
}

interface SeatMapProps {
  readonly seats: Seat[];
  readonly onSeatToggle: (row: string, col: number) => void;
  readonly demandBadge?: string;
  readonly badgeLabel?: string | null;
  readonly maxSeats?: number;
}

function SeatIcon({ status }: Readonly<{ status: SeatStatus }>) {
  const isReserved = status === 'reserved' || status === 'locked';
  const isSelected = status === 'selected';

  let seatColor: string;
  if (isReserved) {
    seatColor = '#1a1a1a';
  } else if (isSelected) {
    seatColor = '#4b5563';
  } else {
    seatColor = 'none';
  }

  let borderColor: string;
  if (isReserved) {
    borderColor = '#1a1a1a';
  } else if (isSelected) {
    borderColor = '#4b5563';
  } else {
    borderColor = '#6b7280';
  }

  const borderWidth = isReserved || isSelected ? 0 : 2.5;

  return (
    <svg viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="3" y="2" width="30" height="30" rx="4" fill={seatColor} stroke={borderColor} strokeWidth={borderWidth} />
    </svg>
  );
}

function SeatButton({ seat, onToggle }: Readonly<{ seat: Seat | undefined; onToggle: () => void }>) {
  const status = seat?.status ?? 'available';
  const isDisabled = status === 'reserved' || status === 'locked';
  const isSelected = status === 'selected';

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      // aspect-ratio keeps seats proportional as they scale with the grid
      className={[
        'relative w-full aspect-10/11 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded',
        isDisabled ? 'cursor-not-allowed opacity-80' : 'hover:scale-110 cursor-pointer',
        isSelected ? 'scale-110' : '',
      ].join(' ')}
    >
      <SeatIcon status={status} />
      {isSelected && (
        <span className="absolute inset-0 flex items-center justify-center pb-[20%] pointer-events-none">
          <Check className="text-white" style={{ width: '45%', height: '45%', strokeWidth: 3 }} />
        </span>
      )}
    </button>
  );
}

export function SeatMap({ seats, onSeatToggle, demandBadge, badgeLabel, maxSeats }: SeatMapProps) {
  const maxSeatsDisplay = typeof maxSeats === 'number' ? maxSeats : 8;
  const { rows, leftColumns, rightColumns } = useMemo(() => {
    const uniqueRows = [...new Set(seats.map(s => s.row))].sort((a, b) => a.localeCompare(b));
    const uniqueCols = [...new Set(seats.map(s => s.col))].sort((a, b) => a - b);
    const midpoint = Math.ceil(uniqueCols.length / 2);
    return {
      rows: uniqueRows,
      leftColumns: uniqueCols.slice(0, midpoint),
      rightColumns: uniqueCols.slice(midpoint),
    };
  }, [seats]);

  const getSeat = (row: string, col: number) => seats.find(s => s.row === row && s.col === col);

  if (seats.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-300 w-full">
        <p className="text-neutral-600 text-center">No seats available for this showtime.</p>
      </div>
    );
  }

  // CSS grid: label | left seats (1fr each) | aisle | right seats (1fr each) | label
  // Label columns are fixed at 1.25rem; aisle is 0.5rem; seats share remaining space equally.
  const gridCols = `1.25rem repeat(${leftColumns.length}, 1fr) 0.5rem repeat(${rightColumns.length}, 1fr) 1.25rem`;

  return (
    <div className="bg-neutral-50 rounded-xl p-4 sm:p-8 border border-neutral-200 w-full min-w-0">
      {/* Screen */}
      <div className="mb-6 sm:mb-10">
        <div className="w-full h-1.5 bg-neutral-700 rounded-full mb-2" />
        <div className="flex items-center justify-center gap-2">
          <p className="text-center text-neutral-500 text-xs font-semibold tracking-widest uppercase">Screen</p>
          <DemandBadge badge={demandBadge} label={badgeLabel} />
        </div>
      </div>

      {/* Seat rows — grid fills full width, seats scale automatically */}
      <div className="space-y-1 mb-4 sm:mb-6">
        {rows.map(row => (
          <div key={row} className="grid items-center gap-x-0.5" style={{ gridTemplateColumns: gridCols }}>
            <div className="text-neutral-500 font-semibold text-center text-[0.6rem] leading-none">{row}</div>
            {leftColumns.map(col => (
              <SeatButton key={col} seat={getSeat(row, col)} onToggle={() => onSeatToggle(row, col)} />
            ))}
            <div /> {/* aisle */}
            {rightColumns.map(col => (
              <SeatButton key={col} seat={getSeat(row, col)} onToggle={() => onSeatToggle(row, col)} />
            ))}
            <div className="text-neutral-500 font-semibold text-center text-[0.6rem] leading-none">{row}</div>
          </div>
        ))}
      </div>

      {/* Column numbers row */}
      <div className="grid items-center gap-x-0.5 mb-6 sm:mb-8" style={{ gridTemplateColumns: gridCols }}>
        <div />
        {leftColumns.map(col => (
          <div key={col} className="text-center text-neutral-400 text-[0.55rem] font-medium leading-none">{col}</div>
        ))}
        <div />
        {rightColumns.map(col => (
          <div key={col} className="text-center text-neutral-400 text-[0.55rem] font-medium leading-none">{col}</div>
        ))}
        <div />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-8 sm:w-9 sm:h-10"><SeatIcon status="reserved" /></div>
          <span className="text-neutral-600 text-xs font-semibold tracking-wider uppercase">Reserved</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-8 sm:w-9 sm:h-10"><SeatIcon status="available" /></div>
          <span className="text-neutral-600 text-xs font-semibold tracking-wider uppercase">Available</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-7 h-8 sm:w-9 sm:h-10">
            <SeatIcon status="selected" />
            <span className="absolute inset-0 flex items-center justify-center pb-2 pointer-events-none">
              <Check className="text-white" style={{ width: '45%', height: '45%', strokeWidth: 3 }} />
            </span>
          </div>
          <span className="text-neutral-600 text-xs font-semibold tracking-wider uppercase">Selected</span>
        </div>
      </div>
      <p className="text-sm text-neutral-500 mb-2">Select up to {maxSeatsDisplay} seats</p>

    </div>
  );
}

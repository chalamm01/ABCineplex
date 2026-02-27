import { useMemo } from 'react';
import { Check } from 'lucide-react';

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
}

/** Cinema seat SVG icon matching the screenshot style */
function SeatIcon({ status }: { status: SeatStatus }) {
  const isReserved = status === 'reserved' || status === 'locked';
  const isSelected = status === 'selected';

  const seatColor = isReserved ? '#1a1a1a' : isSelected ? '#4b5563' : 'none';
  const borderColor = isReserved ? '#1a1a1a' : isSelected ? '#4b5563' : '#6b7280';
  const borderWidth = isReserved || isSelected ? 0 : 2.5;

  return (
    <svg viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {/* Seat back */}
      <rect x="3" y="2" width="30" height="30" rx="4" fill={seatColor} stroke={borderColor} strokeWidth={borderWidth} />
    </svg>
  );
}

function SeatButton({ seat, onToggle }: { seat: Seat | undefined; onToggle: () => void }) {
  const status = seat?.status ?? 'available';
  const isDisabled = status === 'reserved' || status === 'locked';
  const isSelected = status === 'selected';

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={[
        'relative w-7 h-8 sm:w-10 sm:h-11 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded',
        isDisabled ? 'cursor-not-allowed opacity-80' : 'hover:scale-110 cursor-pointer',
        isSelected ? 'scale-110' : '',
      ].join(' ')}
    >
      <SeatIcon status={status} />
      {isSelected && (
        <span className="absolute inset-0 flex items-center justify-center pb-2 pointer-events-none">
          <Check className="text-white" style={{ width: '45%', height: '45%', strokeWidth: 3 }} />
        </span>
      )}
    </button>
  );
}

export function SeatMap({ seats, onSeatToggle }: SeatMapProps) {
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
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-300 w-1/2">
        <p className="text-neutral-600 text-center">No seats available for this showtime.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 rounded-xl p-6 sm:p-8 border border-neutral-200 w-1/2">
      {/* Screen */}
      <div className="mb-8 sm:mb-12">
        <div className="w-full h-1.5 bg-gradient-to-r from-neutral-700 via-neutral-700 to-neutral-700 rounded-full mb-2" />
        <p className="text-center text-neutral-500 text-xs font-semibold tracking-widest uppercase">Screen</p>
      </div>

      {/* Seats Grid */}
      <div className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8">
        {rows.map(row => (
          <div key={row} className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-6 sm:w-8 text-neutral-500 font-semibold text-center text-xs sm:text-sm">{row}</div>
            <div className="flex-1 flex justify-center gap-1 sm:gap-1.5">
              {leftColumns.map(col => (
                <SeatButton key={col} seat={getSeat(row, col)} onToggle={() => onSeatToggle(row, col)} />
              ))}
              {rightColumns.length > 0 && <div className="w-4 sm:w-8" />}
              {rightColumns.map(col => (
                <SeatButton key={col} seat={getSeat(row, col)} onToggle={() => onSeatToggle(row, col)} />
              ))}
            </div>
            <div className="w-6 sm:w-8 text-neutral-500 font-semibold text-center text-xs sm:text-sm">{row}</div>
          </div>
        ))}
      </div>

      {/* Seat Numbers */}
      <div className="flex items-center gap-1 sm:gap-1.5 mb-6 sm:mb-8">
        <div className="w-6 sm:w-8" />
        <div className="flex-1 flex justify-center gap-1 sm:gap-1.5">
          {leftColumns.map(col => (
            <div key={col} className="w-7 sm:w-10 text-center text-neutral-400 text-xs font-medium">{col}</div>
          ))}
          {rightColumns.length > 0 && <div className="w-4 sm:w-8" />}
          {rightColumns.map(col => (
            <div key={col} className="w-7 sm:w-10 text-center text-neutral-400 text-xs font-medium">{col}</div>
          ))}
        </div>
        <div className="w-6 sm:w-8" />
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
    </div>
  );
}
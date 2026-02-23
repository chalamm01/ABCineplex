import { useMemo } from 'react';

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

export function SeatMap({ seats, onSeatToggle }: SeatMapProps) {
  const { rows, leftColumns, rightColumns } = useMemo(() => {
    const uniqueRows = [...new Set(seats.map(s => s.row))].sort((a, b) => a.localeCompare(b));
    const uniqueCols = [...new Set(seats.map(s => s.col))].sort((a, b) => a - b);

    const midpoint = Math.ceil(uniqueCols.length / 2);

    return {
      rows: uniqueRows,
      leftColumns: uniqueCols.slice(0, midpoint),
      rightColumns: uniqueCols.slice(midpoint)
    };
  }, [seats]);

  const getSeat = (row: string, col: number) => {
    return seats.find((s) => s.row === row && s.col === col);
  };

  const getSeatClassName = (seat: Seat | undefined) => {
    if (seat?.status === 'reserved' || seat?.status === 'locked') {
      return 'bg-neutral-300 border-neutral-400 cursor-not-allowed';
    }
    if (seat?.status === 'selected') {
      return 'bg-black border-black scale-110 shadow-lg shadow-black/30';
    }
    return 'bg-neutral-100 border-neutral-300 hover:border-black hover:scale-105';
  };

  if (seats.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-300">
        <p className="text-neutral-600 text-center">No seats available for this showtime.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-300">
      {/* Screen */}
      <div className="mb-8 sm:mb-12">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-black to-transparent rounded-full mb-2" />
        <div className="text-center text-black text-sm font-semibold tracking-widest">
          SCREEN
        </div>
      </div>

      {/* Seats Grid */}
      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 sm:w-8 text-black font-semibold text-center text-xs sm:text-sm">{row}</div>
            <div className="flex-1 flex justify-center gap-1.5 sm:gap-2">
              {/* Left section */}
              {leftColumns.map((col) => {
                const seat = getSeat(row, col);
                return (
                  <button
                    key={col}
                    onClick={() => onSeatToggle(row, col)}
                    disabled={seat?.status === 'reserved' || seat?.status === 'locked'}
                    className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg border-2 transition-all ${getSeatClassName(seat)}`}
                  />
                );
              })}
              {/* Aisle */}
              {rightColumns.length > 0 && <div className="w-4 sm:w-8" />}
              {/* Right section */}
              {rightColumns.map((col) => {
                const seat = getSeat(row, col);
                return (
                  <button
                    key={col}
                    onClick={() => onSeatToggle(row, col)}
                    disabled={seat?.status === 'reserved' || seat?.status === 'locked'}
                    className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg border-2 transition-all ${getSeatClassName(seat)}`}
                  />
                );
              })}
            </div>
            <div className="w-6 sm:w-8 text-black font-semibold text-center text-xs sm:text-sm">{row}</div>
          </div>
        ))}
      </div>

      {/* Seat Numbers */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
        <div className="w-6 sm:w-8" />
        <div className="flex-1 flex justify-center gap-1.5 sm:gap-2">
          {leftColumns.map((col) => (
            <div key={col} className="w-7 sm:w-10 text-center text-neutral-600 text-xs sm:text-sm font-medium">
              {col}
            </div>
          ))}
          {rightColumns.length > 0 && <div className="w-4 sm:w-8" />}
          {rightColumns.map((col) => (
            <div key={col} className="w-7 sm:w-10 text-center text-neutral-600 text-xs sm:text-sm font-medium">
              {col}
            </div>
          ))}
        </div>
        <div className="w-6 sm:w-8" />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 sm:gap-8 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-neutral-300 rounded-lg border-2 border-neutral-400" />
          <span className="text-black text-xs sm:text-sm font-medium">RESERVED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-neutral-100 rounded-lg border-2 border-neutral-300" />
          <span className="text-black text-xs sm:text-sm font-medium">AVAILABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-lg border-2 border-black" />
          <span className="text-black text-xs sm:text-sm font-medium">SELECTED</span>
        </div>
      </div>
    </div>
  );
}

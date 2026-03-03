import { useState, useEffect } from 'react';
import { adminApi, type Seat } from '@/services/api';
import { Modal, ModalActions } from './AdminShared';

interface SeatMapModalProps {
  isOpen: boolean;
  title: string;
  theatreId: number;
  showtimeId?: number;
  rows: number;
  columns: number;
  onClose: () => void;
  onSave: (seatGrid: Map<string, boolean>) => Promise<void>;
}

export function SeatMapModal({
  isOpen,
  title,
  theatreId,
  showtimeId,
  rows: propRows,
  columns: propColumns,
  onClose,
  onSave,
}: SeatMapModalProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatGrid, setSeatGrid] = useState<Map<string, boolean>>(new Map());
  const [rows, setRows] = useState(propRows);
  const [columns, setColumns] = useState(propColumns);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSeats();
    }
  }, [isOpen, theatreId, showtimeId, propRows, propColumns]);

  async function loadSeats() {
    setLoading(true);
    try {
      let data;

      // If showtimeId provided, load showtime-specific seats
      if (showtimeId) {
        data = await adminApi.listShowtimeSeats(showtimeId);
        // Map showtime_seats response to seat format
        const theatreSeats = await adminApi.listSeats(theatreId);
        const seatMap = new Map(theatreSeats.map(s => [s.id, s]));

        const mappedData = data.map((ss: any) => ({
          id: ss.seat_id,
          theatre_id: theatreId,
          row_label: seatMap.get(ss.seat_id)?.row_label || '',
          seat_number: seatMap.get(ss.seat_id)?.seat_number || 0,
          is_active: ss.is_available,
          created_at: ss.created_at,
        }));
        data = mappedData;
      } else {
        // Load theatre seats
        data = await adminApi.listSeats(theatreId);
      }

      setSeats(data);

      // Calculate actual rows and columns from seat data
      const uniqueRows = new Set<string>();
      let maxSeatNumber = 0;

      data.forEach((seat: any) => {
        uniqueRows.add(seat.row_label);
        if (seat.seat_number > maxSeatNumber) {
          maxSeatNumber = seat.seat_number;
        }
      });

      const calculatedRows = uniqueRows.size;
      const calculatedColumns = maxSeatNumber;

      setRows(calculatedRows);
      setColumns(calculatedColumns);

      // Build grid map
      const gridMap = new Map<string, boolean>();

      // Default all seats to active, ordered by row
      const sortedRows = Array.from(uniqueRows).sort();
      sortedRows.forEach(rowLabel => {
        for (let c = 1; c <= calculatedColumns; c++) {
          const key = `${rowLabel}-${c}`;
          gridMap.set(key, true);
        }
      });

      // Override with actual data
      data.forEach((seat: any) => {
        const key = `${seat.row_label}-${seat.seat_number}`;
        gridMap.set(key, seat.is_active);
      });

      setSeatGrid(gridMap);
    } catch (e) {
      console.error('Failed to load seats:', e);
      setError('Failed to load seats');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await onSave(seatGrid);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  // Get unique row labels from seat data if available
  const uniqueRowLabels = new Set<string>();
  seats.forEach(seat => uniqueRowLabels.add(seat.row_label));
  const rowLabels = uniqueRowLabels.size > 0
    ? Array.from(uniqueRowLabels).sort()
    : Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

  if (!isOpen) return null;

  // Calculate left/right column split (walkway in middle)
  const midpoint = Math.ceil(columns / 2);
  const leftColumns = Array.from({ length: midpoint }, (_, i) => i + 1);
  const rightColumns = Array.from({ length: columns - midpoint }, (_, i) => midpoint + i + 1);

  // Calculate responsive seat button size based on grid dimensions
  const calculateSeatSize = () => {
    if (columns > 24) return 'w-4 h-4 text-[10px]';
    if (columns > 20) return 'w-5 h-5 text-xs';
    if (columns > 15) return 'w-6 h-6 text-xs';
    return 'w-7 h-7 text-xs';
  };

  const seatSizeClass = calculateSeatSize();

  return (
    <Modal title={title} onClose={onClose}>
      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        <strong>Instructions:</strong> Green = Active, Gray = Disabled. Click seats to toggle.
      </div>

      {loading ? (
        <div className="text-center py-6 text-neutral-500 text-sm">Loading seats...</div>
      ) : (
        <div className="flex justify-center w-full max-h-[calc(95vh-240px)]">
          <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 border border-neutral-200 w-full overflow-hidden">
            {/* Screen */}
            <div className="mb-4">
              <div className="w-full h-1 bg-gradient-to-r from-neutral-700 via-neutral-700 to-neutral-700 rounded-full mb-1" />
              <p className="text-center text-neutral-400 text-[10px] font-semibold tracking-widest uppercase">Screen</p>
            </div>

            {/* Seats Grid */}
            <div className={`space-y-${columns > 20 ? '0.5' : '1'} mb-3 overflow-x-auto`}>
              {rowLabels.map(row => (
                <div key={row} className="flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap">
                  <div className={columns > 15 ? 'w-3' : 'w-4'} >
                    <button
                      onClick={() => {
                        const newGrid = new Map(seatGrid);
                        const rowActive = Array.from({ length: columns }, (_, i) => i + 1)
                          .some(col => seatGrid.get(`${row}-${col}`));
                        Array.from({ length: columns }, (_, i) => i + 1).forEach(col => {
                          newGrid.set(`${row}-${col}`, !rowActive);
                        });
                        setSeatGrid(newGrid);
                      }}
                      className={`text-neutral-600 font-bold ${columns > 15 ? 'text-[10px]' : 'text-xs'} hover:bg-neutral-200 px-0.5 rounded`}
                      title="Click to toggle entire row"
                    >
                      {row}
                    </button>
                  </div>

                  <div className="flex gap-0.5">
                    {leftColumns.map(col => {
                      const key = `${row}-${col}`;
                      const isActive = seatGrid.get(key) ?? true;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            const newGrid = new Map(seatGrid);
                            newGrid.set(key, !isActive);
                            setSeatGrid(newGrid);
                          }}
                          className={`${seatSizeClass} border rounded font-semibold transition-colors flex items-center justify-center ${
                            isActive
                              ? 'bg-green-100 border-green-400 text-green-700 hover:bg-red-100 hover:border-red-400 hover:text-red-700'
                              : 'bg-neutral-200 border-neutral-300 text-neutral-500 hover:bg-green-100 hover:border-green-400 hover:text-green-700'
                          }`}
                          title={isActive ? 'Active (Click to disable)' : 'Disabled (Click to enable)'}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>

                  {rightColumns.length > 0 && <div className={columns > 15 ? 'w-2' : 'w-3'} />}

                  <div className="flex gap-0.5">
                    {rightColumns.map(col => {
                      const key = `${row}-${col}`;
                      const isActive = seatGrid.get(key) ?? true;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            const newGrid = new Map(seatGrid);
                            newGrid.set(key, !isActive);
                            setSeatGrid(newGrid);
                          }}
                          className={`${seatSizeClass} border rounded font-semibold transition-colors flex items-center justify-center ${
                            isActive
                              ? 'bg-green-100 border-green-400 text-green-700 hover:bg-red-100 hover:border-red-400 hover:text-red-700'
                              : 'bg-neutral-200 border-neutral-300 text-neutral-500 hover:bg-green-100 hover:border-green-400 hover:text-green-700'
                          }`}
                          title={isActive ? 'Active (Click to disable)' : 'Disabled (Click to enable)'}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>

                  <div className={`${columns > 15 ? 'w-3' : 'w-4'} text-neutral-400 font-semibold text-[10px] text-center`}>{row}</div>
                </div>
              ))}
            </div>

            {/* Seat Numbers */}
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-neutral-400 text-[9px] font-medium whitespace-nowrap">
              <div className={columns > 15 ? 'w-3' : 'w-4'} />
              <div className="flex gap-0.5">
                {leftColumns.map(col => (
                  <div key={`left-num-${col}`} className={`${seatSizeClass} flex items-center justify-center`}>
                    {col}
                  </div>
                ))}
              </div>
              {rightColumns.length > 0 && <div className={columns > 15 ? 'w-2' : 'w-3'} />}
              <div className="flex gap-0.5">
                {rightColumns.map(col => (
                  <div key={`right-num-${col}`} className={`${seatSizeClass} flex items-center justify-center`}>
                    {col}
                  </div>
                ))}
              </div>
              <div className={columns > 15 ? 'w-3' : 'w-4'} />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 flex-wrap pt-2 mt-2 border-t border-neutral-200">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`${seatSizeClass} bg-green-100 border border-green-400 rounded`} />
                <span className="text-neutral-600 text-[9px] font-semibold">Active</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className={`${seatSizeClass} bg-neutral-200 border border-neutral-300 rounded`} />
                <span className="text-neutral-600 text-[9px] font-semibold">Disabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      <ModalActions
        onCancel={onClose}
        onSubmit={handleSave}
        submitLabel={saving ? 'Saving...' : 'Save Changes'}
        error={error}
        disabled={loading || saving}
      />
    </Modal>
  );
}

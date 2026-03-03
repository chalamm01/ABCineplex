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
  rows,
  columns,
  onClose,
  onSave,
}: SeatMapModalProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatGrid, setSeatGrid] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSeats();
    }
  }, [isOpen, theatreId, showtimeId]);

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

      // Build grid map
      const gridMap = new Map<string, boolean>();

      // Default all seats to active
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= columns; c++) {
          const key = `${rowLabel}-${c}`;
          gridMap.set(key, true);
        }
      }

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

  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

  if (!isOpen) return null;

  return (
    <Modal title={title} onClose={onClose}>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        <strong>Instructions:</strong> Green seats are available (can be booked). Gray seats are disabled (cannot be booked).
        Click any seat to toggle. Click row/column headers for bulk changes.
      </div>

      {loading ? (
        <div className="text-center py-8 text-neutral-500">Loading seats...</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block p-4 bg-neutral-50 rounded border border-neutral-200">
            <div className="space-y-2">
              {/* Column headers */}
              <div className="flex gap-2 items-center">
                <span className="w-6"></span>
                <div className="flex gap-1">
                  {Array.from({ length: columns }, (_, i) => i + 1).map(col => (
                    <button
                      key={`col-${col}`}
                      onClick={() => {
                        const newGrid = new Map(seatGrid);
                        const colActive = rowLabels.some(row => seatGrid.get(`${row}-${col}`));
                        rowLabels.forEach(row => {
                          newGrid.set(`${row}-${col}`, !colActive);
                        });
                        setSeatGrid(newGrid);
                      }}
                      className="w-8 h-8 border rounded text-xs font-semibold bg-neutral-300 hover:bg-neutral-400 text-neutral-700"
                      title="Click to disable/enable entire column"
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row headers with seats */}
              {rowLabels.map(row => (
                <div key={row} className="flex gap-2 items-center">
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
                    className="w-6 font-bold text-neutral-600 hover:bg-neutral-200 px-1 rounded"
                    title="Click to disable/enable entire row"
                  >
                    {row}
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: columns }, (_, i) => i + 1).map(col => {
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
                          className={`w-8 h-8 border rounded text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-green-100 border-green-400 text-green-700 hover:bg-red-100 hover:border-red-400 hover:text-red-700'
                              : 'bg-neutral-200 border-neutral-300 text-neutral-500 hover:bg-green-100 hover:border-green-400 hover:text-green-700'
                          }`}
                          title={isActive ? 'Click to disable' : 'Click to enable'}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-neutral-500 space-y-1">
              <p>🟢 Green = Active seat (can be booked)</p>
              <p>⚪ Gray = Disabled seat (cannot be booked)</p>
              <p>Click any seat to toggle status. Click row/column headers for bulk changes.</p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

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

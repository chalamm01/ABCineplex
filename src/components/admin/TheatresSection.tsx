import { useState, useEffect } from 'react';
import { adminApi, type Theatre, type TheatreCreate, type TheatreUpdate, type Seat } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader,
  inputCls, btnEdit, btnDanger, useSort, SortableTableHead,
} from './AdminShared';

type ModalMode = 'add' | 'edit' | 'seats' | null;

const emptyTheatre: TheatreCreate = {
  name: '',
  columns: 15,
  rows: 8,
};

export default function TheatresSection() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<TheatreCreate>(emptyTheatre);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState<number | null>(null);
  const [seatGrid, setSeatGrid] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    loadTheatres();
  }, []);

  async function loadTheatres() {
    setLoading(true);
    try {
      const data = await adminApi.listTheatres();
      setTheatres(data);
    } catch (e) {
      console.error('Failed to load theatres:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSeats(theatreId: number) {
    try {
      const data = await adminApi.listSeats(theatreId);
      setSeats(data);

      // Build grid map for visual representation
      // Default: all seats are ACTIVE (available/green)
      const gridMap = new Map<string, boolean>();

      // First, mark all seats as active by default
      const theatreData = theatres.find(t => t.id === theatreId);
      if (theatreData?.layout_json) {
        const layout = theatreData.layout_json as any;
        const rows = layout.rows || 8;
        const cols = layout.columns || 15;
        for (let r = 0; r < rows; r++) {
          const rowLabel = String.fromCharCode(65 + r); // A, B, C, ...
          for (let c = 1; c <= cols; c++) {
            const key = `${rowLabel}-${c}`;
            gridMap.set(key, true); // Default to active/available
          }
        }
      }

      // Then override with actual data (mark disabled ones from DB)
      data.forEach(seat => {
        const key = `${seat.row_label}-${seat.seat_number}`;
        gridMap.set(key, seat.is_active);
      });
      setSeatGrid(gridMap);
    } catch (e) {
      console.error('Failed to load seats:', e);
    }
  }

  function openAdd() {
    setForm(emptyTheatre);
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(t: Theatre) {
    setForm({
      name: t.name,
      columns: t.total_seats ? 15 : 15, // Default, could parse from layout_json
      rows: t.total_seats ? (t.total_seats / 15) : 8,
    });
    setEditId(t.id);
    setModal('edit');
    setError('');
  }

  function openSeatMap(t: Theatre) {
    setSelectedTheatreId(t.id);
    loadSeats(t.id);
    setModal('seats');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this theatre? This will also delete all associated seats.')) return;
    try {
      await adminApi.deleteTheatre(id);
      loadTheatres();
    } catch (e) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    if (!form.name.trim()) {
      setError('Theatre name is required');
      return;
    }

    try {
      if (modal === 'edit' && editId != null) {
        await adminApi.updateTheatre(editId, {
          name: form.name,
          columns: form.columns,
          rows: form.rows,
        });
      } else {
        await adminApi.createTheatre(form);
      }
      setModal(null);
      loadTheatres();
    } catch (e) {
      setError(String(e));
    }
  }

  const f = (field: keyof TheatreCreate, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const filteredTheatres = theatres.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      String(t.id).includes(q) ||
      String(t.total_seats).includes(q)
    );
  });

  const { sorted: sortedTheatres, sort, toggle } = useSort(filteredTheatres);

  const rowLabels = Array.from({ length: form.rows }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...

  return (
    <div>
      <SectionHeader title="Theatres" onAdd={openAdd} addLabel="+ Add Theatre" />

      {search && (
        <div className="mb-4">
          <input
            className={`${inputCls} max-w-xs`}
            placeholder="Search theatre…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="text-neutral-400 w-6 h-6" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left">
            <SortableTableHead
              sort={sort}
              onSort={toggle}
              cols={[
                { label: 'ID', key: 'id' },
                { label: 'Name', key: 'name' },
                { label: 'Total Seats', key: 'total_seats' },
                { label: 'Actions', key: '' },
              ]}
            />
            <tbody>
              {sortedTheatres.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-neutral-400 text-center">
                    No theatres. Click "Add Theatre" to create one.
                  </td>
                </tr>
              )}
              {sortedTheatres.map(t => (
                <tr key={t.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2.5 text-neutral-400">{t.id}</td>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">{t.name}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{t.total_seats}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        className={btnEdit}
                        onClick={() => openEdit(t)}
                      >
                        Edit
                      </button>
                      <button
                        className={btnEdit}
                        onClick={() => openSeatMap(t)}
                      >
                        Seats
                      </button>
                      <button
                        className={btnDanger}
                        onClick={() => handleDelete(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Theatre' : 'Edit Theatre'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Theatre Name">
              <input
                className={inputCls}
                placeholder="e.g., Hall A, Screen 1…"
                value={form.name}
                onChange={e => f('name', e.target.value)}
              />
            </Field>
            <Field label="Columns (Seats per Row)">
              <input
                className={inputCls}
                type="number"
                min="5"
                max="30"
                value={form.columns}
                onChange={e => f('columns', +e.target.value)}
              />
            </Field>
            <Field label="Rows">
              <input
                className={inputCls}
                type="number"
                min="3"
                max="20"
                value={form.rows}
                onChange={e => f('rows', +e.target.value)}
              />
            </Field>
            <div className="text-xs text-neutral-400 flex items-center pt-2">
              Total: {form.columns * form.rows} seats
            </div>
          </div>
          <ModalActions
            onCancel={() => setModal(null)}
            onSubmit={handleSubmit}
            submitLabel={modal === 'add' ? 'Create' : 'Save Changes'}
            error={error}
          />
        </Modal>
      )}

      {modal === 'seats' && selectedTheatreId && (
        <Modal
          title={`Edit Seat Map - ${theatres.find(t => t.id === selectedTheatreId)?.name}`}
          onClose={() => setModal(null)}
        >
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            <strong>Instructions:</strong> All seats are available (green) by default. Click a seat to <strong>disable</strong> it (gray).
            Click row/column headers to bulk disable/enable all seats in that row/column.
          </div>
          <div className="overflow-x-auto">
            <div className="inline-block p-4 bg-neutral-50 rounded border border-neutral-200">
              <div className="space-y-2">
                {/* Column headers */}
                <div className="flex gap-2 items-center">
                  <span className="w-6"></span>
                  <div className="flex gap-1">
                    {Array.from({ length: form.columns }, (_, i) => i + 1).map(col => (
                      <button
                        key={`col-${col}`}
                        onClick={() => {
                          // Bulk enable/disable column
                          const newGrid = new Map(seatGrid);
                          const allRows = Array.from({ length: rowLabels.length }, (_, i) => String.fromCharCode(65 + i));
                          const colActive = allRows.some(row => seatGrid.get(`${row}-${col}`));
                          allRows.forEach(row => {
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
                        // Bulk enable/disable row
                        const newGrid = new Map(seatGrid);
                        const rowActive = Array.from({ length: form.columns }, (_, i) => i + 1)
                          .some(col => seatGrid.get(`${row}-${col}`));
                        Array.from({ length: form.columns }, (_, i) => i + 1).forEach(col => {
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
                      {Array.from({ length: form.columns }, (_, i) => i + 1).map(col => {
                        const key = `${row}-${col}`;
                        const isActive = seatGrid.get(key) ?? true; // Default to active
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
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setModal(null)}
              className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!selectedTheatreId) return;
                try {
                  // Save all seat changes to database
                  for (const [key, isActive] of seatGrid.entries()) {
                    const [row, colStr] = key.split('-');
                    const col = parseInt(colStr, 10);
                    const seat = seats.find(s => s.row_label === row && s.seat_number === col);

                    if (seat) {
                      // Update existing seat
                      await adminApi.updateSeat(selectedTheatreId, seat.id, { is_active: isActive });
                    } else {
                      // Create new seat if it doesn't exist
                      await adminApi.createSeat(selectedTheatreId, {
                        theatre_id: selectedTheatreId,
                        row_label: row,
                        seat_number: col,
                        is_active: isActive,
                      });
                    }
                  }
                  setModal(null);
                  // Refresh theatres list
                  loadTheatres();
                } catch (e) {
                  alert(`Failed to save seats: ${e}`);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

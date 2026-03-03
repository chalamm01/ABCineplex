import { useState, useEffect } from 'react';
import { adminApi, type Theatre, type TheatreCreate, type TheatreUpdate, type Seat } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { SeatMapModal } from './SeatMapModal';
import {
  Modal, Field, ModalActions, SectionHeader,
  inputCls, btnEdit, btnDanger, useSort, SortableTableHead,
  EditButton, DeleteButton,
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
  const [seatMapOpen, setSeatMapOpen] = useState(false);

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
    // Calculate rows and columns from total_seats
    // Default to 15 columns, then calculate rows
    const defaultColumns = 15;
    const calculatedRows = Math.ceil(t.total_seats / defaultColumns);
    setForm({
      name: t.name,
      columns: defaultColumns,
      rows: calculatedRows,
    });
    setEditId(t.id);
    setModal('edit');
    setError('');
  }

  function openSeatMap(t: Theatre) {
    setSelectedTheatreId(t.id);
    loadSeats(t.id);
    setSeatMapOpen(true);
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
                      <EditButton onClick={() => openEdit(t)} />
                      <button
                        className={btnEdit}
                        onClick={() => openSeatMap(t)}
                      >
                        Seats
                      </button>
                      <DeleteButton onClick={() => handleDelete(t.id)} />
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

      <SeatMapModal
        isOpen={seatMapOpen}
        title={`Edit Seat Map - ${theatres.find(t => t.id === selectedTheatreId)?.name}`}
        theatreId={selectedTheatreId ?? 0}
        rows={form.rows}
        columns={form.columns}
        onClose={() => setSeatMapOpen(false)}
        onSave={async (seatGrid: Map<string, boolean>) => {
          if (!selectedTheatreId) return;

          // Build map of original seat states for quick lookup
          const originalSeats = new Map<string, Seat>();
          seats.forEach(seat => {
            const key = `${seat.row_label}-${seat.seat_number}`;
            originalSeats.set(key, seat);
          });

          // Collect only changed seats
          const updatePromises: Promise<void>[] = [];

          for (const [key, newIsActive] of seatGrid.entries()) {
            const [row, colStr] = key.split('-');
            const col = parseInt(colStr, 10);
            const originalSeat = originalSeats.get(key);
            const hasChanged = !originalSeat || originalSeat.is_active !== newIsActive;

            if (!hasChanged) continue; // Skip unchanged seats

            if (originalSeat) {
              // Only update if changed
              updatePromises.push(
                adminApi.updateSeat(selectedTheatreId, originalSeat.id, { is_active: newIsActive })
              );
            } else {
              // Create new seat
              updatePromises.push(
                adminApi.createSeat(selectedTheatreId, {
                  theatre_id: selectedTheatreId,
                  row_label: row,
                  seat_number: col,
                  is_active: newIsActive,
                })
              );
            }
          }

          // Execute all requests in parallel
          if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
          }

          loadTheatres();
        }}
      />
    </div>
  );
}

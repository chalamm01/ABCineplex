import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import type { AdminUserResponse } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, ActiveIcon,
  inputCls, btnEdit, useSort, SortableTableHead,
} from './AdminShared';

interface UserEditForm {
  full_name: string;
  membership_tier: string;
  is_student: boolean;
  student_id_verified: boolean;
  loyalty_points: number;
  points_adjustment_reason: string;
  is_admin: boolean;
}

const TIER_BADGE: Record<string, string> = {
  none: 'bg-neutral-100 text-neutral-500',
  free: 'bg-blue-100 text-blue-700',
  paid: 'bg-amber-100 text-amber-700',
};

function TierBadge({ tier }: Readonly<{ tier: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_BADGE[tier] ?? 'bg-neutral-100 text-neutral-600'}`}>
      {tier}
    </span>
  );
}

export default function UsersSection() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<UserEditForm>({
    full_name: '',
    membership_tier: 'free', is_student: false,
    student_id_verified: false, loyalty_points: 0, points_adjustment_reason: '', is_admin: false,
  });
  const [editUser, setEditUser] = useState<AdminUserResponse | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    adminApi.getUsers(undefined, 0, 100)
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function handleDeactivate(u: AdminUserResponse) {
    if (!confirm(`${u.is_active ? 'Deactivate' : 'Reactivate'} user ${u.email}?`)) return;
    try {
      if (u.is_active) {
        await adminApi.deleteUser(u.user_id);
      } else {
        await adminApi.updateUser(u.user_id, { is_active: true });
      }
      refresh();
    } catch (e) {
      alert(String(e));
    }
  }

  function openEdit(u: AdminUserResponse) {
    setForm({
      full_name: u.full_name || '',
      membership_tier: u.membership_tier,
      is_student: u.is_student,
      student_id_verified: u.student_id_verified,
      loyalty_points: u.loyalty_points,
      points_adjustment_reason: '',
      is_admin: u.is_admin,
    });
    setEditUser(u);
    setModal(true);
    setError('');
  }

  async function handleSubmit() {
    if (!editUser) return;
    setError('');
    try {
      await adminApi.updateUser(editUser.user_id, form);
      setModal(false);
      refresh();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const f = (field: keyof UserEditForm, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.user_name ?? '').toLowerCase().includes(q)
    );
  });

  const { sorted, sort, toggle } = useSort(filtered);

  return (
    <div>
      <SectionHeader title="Users" count={users.length} onAdd={() => {}} addLabel="" />

      {/* Search */}
      <div className="mb-4">
        <input
          className={inputCls}
          style={{ maxWidth: '320px' }}
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left">
            <SortableTableHead
              sort={sort} onSort={toggle}
              cols={[
                { label: 'Name',       key: 'full_name' },
                { label: 'Email',      key: 'email' },
                { label: 'Membership', key: 'membership_tier' },
                { label: 'Student',    key: 'is_student' },
                { label: 'Verified',   key: 'student_id_verified' },
                { label: 'Points',     key: 'loyalty_points' },
                { label: 'Admin',      key: 'is_admin' },
                { label: 'Active',     key: 'is_active' },
                { label: 'Actions',    key: '' },
              ]}
            />
            <tbody>
              {sorted.length === 0 && (
                <tr key="empty"><td colSpan={9} className="px-3 py-6 text-neutral-400 text-center">No users found.</td></tr>
              )}
              {sorted.map(u => (
                <tr key={u.user_id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2.5 text-neutral-900 font-medium whitespace-nowrap">
                    {u.full_name || <span className="text-neutral-400 italic">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 max-w-45 truncate">{u.email}</td>
                  <td className="px-3 py-2.5"><TierBadge tier={u.membership_tier} /></td>
                  <td className="px-3 py-2.5"><ActiveIcon active={u.is_student} /></td>
                  <td className="px-3 py-2.5"><ActiveIcon active={u.student_id_verified} /></td>
                  <td className="px-3 py-2.5 text-neutral-600">{u.loyalty_points}</td>
                  <td className="px-3 py-2.5">
                    {u.is_admin && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">admin</span>}
                  </td>
                  <td className="px-3 py-2.5"><ActiveIcon active={u.is_active} /></td>
                  <td className="px-3 py-2.5 flex gap-1">
                    <button className={btnEdit} onClick={() => openEdit(u)}>Edit</button>
                    <button
                      className={`text-xs px-2 py-1 rounded font-medium transition-colors border ${
                        u.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                      }`}
                      onClick={() => handleDeactivate(u)}
                    >
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && editUser && (
        <Modal title={`Edit User — ${editUser.email}`} onClose={() => setModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Full Name">
                <input className={inputCls} value={form.full_name} onChange={e => f('full_name', e.target.value)} />
              </Field>
            </div>
            <Field label="Membership Tier">
              <select className={inputCls} value={form.membership_tier} onChange={e => f('membership_tier', e.target.value)}>
                <option value="none">None</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </Field>
            <Field label="Loyalty Points">
              <input className={inputCls} type="number" min="0" value={form.loyalty_points} onChange={e => f('loyalty_points', +e.target.value)} />
            </Field>
            <Field label="Reason for Points Adjustment">
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. correction, compensation, promo"
                value={form.points_adjustment_reason}
                onChange={e => f('points_adjustment_reason', e.target.value)}
              />
            </Field>
            <Field label="Is Student">
              <select className={inputCls} value={form.is_student ? '1' : '0'} onChange={e => f('is_student', e.target.value === '1')}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </Field>
            <Field label="Student ID Verified">
              <select className={inputCls} value={form.student_id_verified ? '1' : '0'} onChange={e => f('student_id_verified', e.target.value === '1')}>
                <option value="1">Verified</option>
                <option value="0">Not Verified</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Admin Access">
                <select className={inputCls} value={form.is_admin ? '1' : '0'} onChange={e => f('is_admin', e.target.value === '1')}>
                  <option value="0">No</option>
                  <option value="1">Yes — grant admin access</option>
                </select>
              </Field>
              {form.is_admin && !editUser.is_admin && (
                <p className="text-amber-600 text-xs mt-1">
                  ⚠ This will grant full admin access to this user.
                </p>
              )}
            </div>
          </div>
          <ModalActions
            onCancel={() => setModal(false)}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            error={error}
          />
        </Modal>
      )}
    </div>
  );
}

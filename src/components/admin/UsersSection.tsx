import { useState, useEffect, useCallback } from 'react';
import { adminApi, type UserProfile } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead, ActiveIcon,
  inputCls, btnEdit,
} from './AdminShared';

interface UserEditForm {
  first_name: string;
  last_name: string;
  membership_tier: 'none' | 'free' | 'paid';
  is_student: boolean;
  student_id_verified: boolean;
  reward_points: number;
  is_admin: boolean;
}

const TIER_BADGE: Record<string, string> = {
  none: 'bg-zinc-700 text-zinc-300',
  free: 'bg-blue-900 text-blue-300',
  paid: 'bg-yellow-900 text-yellow-300',
};

function TierBadge({ tier }: Readonly<{ tier: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_BADGE[tier] ?? 'bg-zinc-700 text-zinc-300'}`}>
      {tier}
    </span>
  );
}

export default function UsersSection() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<UserEditForm>({
    first_name: '', last_name: '',
    membership_tier: 'free', is_student: false,
    student_id_verified: false, reward_points: 0, is_admin: false,
  });
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
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

  function openEdit(u: UserProfile) {
    setForm({
      first_name: u.first_name,
      last_name: u.last_name,
      membership_tier: u.membership_tier,
      is_student: u.is_student,
      student_id_verified: u.student_id_verified,
      reward_points: u.reward_points,
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
      await adminApi.updateUser(editUser.id, form);
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
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      (u.user_name ?? '').toLowerCase().includes(q)
    );
  });

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
        <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <TableHead cols={['Name', 'Email', 'Membership', 'Student', 'Verified', 'Points', 'Admin', 'Actions']} />
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-zinc-500 text-center">No users found.</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-3 py-2 text-white font-medium whitespace-nowrap">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-3 py-2 text-zinc-300 max-w-[180px] truncate">{u.email}</td>
                  <td className="px-3 py-2"><TierBadge tier={u.membership_tier} /></td>
                  <td className="px-3 py-2"><ActiveIcon active={u.is_student} /></td>
                  <td className="px-3 py-2"><ActiveIcon active={u.student_id_verified} /></td>
                  <td className="px-3 py-2 text-zinc-300">{u.reward_points}</td>
                  <td className="px-3 py-2">
                    {u.is_admin && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">admin</span>}
                  </td>
                  <td className="px-3 py-2">
                    <button className={btnEdit} onClick={() => openEdit(u)}>Edit</button>
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
            <Field label="First Name">
              <input className={inputCls} value={form.first_name} onChange={e => f('first_name', e.target.value)} />
            </Field>
            <Field label="Last Name">
              <input className={inputCls} value={form.last_name} onChange={e => f('last_name', e.target.value)} />
            </Field>
            <Field label="Membership Tier">
              <select className={inputCls} value={form.membership_tier} onChange={e => f('membership_tier', e.target.value)}>
                <option value="none">None</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </Field>
            <Field label="Reward Points">
              <input className={inputCls} type="number" min="0" value={form.reward_points} onChange={e => f('reward_points', +e.target.value)} />
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
                <p className="text-yellow-400 text-xs mt-1">
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

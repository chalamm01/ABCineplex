import type { ReactNode } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function splitLines(val: string): string[] {
  return val.split('\n').map(s => s.trim()).filter(Boolean);
}

export function joinLines(arr?: string[]): string {
  return (arr ?? []).join('\n');
}

// ─── CSS class constants ──────────────────────────────────────────────────────

export const inputCls =
  'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 w-full';

export const btnPrimary =
  'bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors';

export const btnSecondary =
  'bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors';

export const btnDanger =
  'bg-red-900 hover:bg-red-800 text-red-300 text-xs font-medium px-2 py-1 rounded transition-colors';

export const btnEdit =
  'bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium px-2 py-1 rounded transition-colors';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: Readonly<ModalProps>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: Readonly<FieldProps>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Modal action footer ──────────────────────────────────────────────────────

interface ModalActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  error?: string;
}

export function ModalActions({ onCancel, onSubmit, submitLabel, error }: Readonly<ModalActionsProps>) {
  return (
    <>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      <div className="flex justify-end gap-2 mt-4">
        <button className={btnSecondary} onClick={onCancel}>Cancel</button>
        <button className={btnPrimary} onClick={onSubmit}>{submitLabel}</button>
      </div>
    </>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  now_showing: 'bg-green-900 text-green-300',
  coming_soon: 'bg-blue-900 text-blue-300',
  ended: 'bg-zinc-700 text-zinc-400',
  true: 'bg-green-900 text-green-300',
  false: 'bg-zinc-700 text-zinc-400',
};

export function StatusBadge({ value }: Readonly<{ value: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[value] ?? 'bg-zinc-700 text-zinc-300'}`}>
      {value}
    </span>
  );
}

// ─── Active indicator ─────────────────────────────────────────────────────────

export function ActiveIcon({ active }: Readonly<{ active: boolean }>) {
  return active
    ? <span className="text-green-400 font-bold">✓</span>
    : <span className="text-zinc-500">✗</span>;
}

// ─── Section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  count?: number;
  onAdd: () => void;
  addLabel: string;
}

export function SectionHeader({ title, count, onAdd, addLabel }: Readonly<SectionHeaderProps>) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-white font-semibold text-lg">
        {title}{count !== undefined && <span className="text-zinc-400 font-normal ml-1">({count})</span>}
      </h2>
      <button className={btnPrimary} onClick={onAdd}>{addLabel}</button>
    </div>
  );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────

export function TableHead({ cols }: Readonly<{ cols: string[] }>) {
  return (
    <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
      <tr>
        {cols.map(col => (
          <th key={col} className="px-3 py-2 whitespace-nowrap">{col}</th>
        ))}
      </tr>
    </thead>
  );
}

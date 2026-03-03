import { useState, useMemo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableHead as ShadTableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function splitLines(val: string): string[] {
  return val.split('\n').map(s => s.trim()).filter(Boolean);
}

export function joinLines(arr?: string[]): string {
  return (arr ?? []).join('\n');
}

/**
 * Consistent date-time formatter for admin tables.
 * Works for both plain TIMESTAMP (no tz — treated as local) and TIMESTAMP WITH TIME ZONE.
 * Output: "1 Mar 2026, 12:00"
 */
export function fmtDT(raw?: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.replace('T', ' ').slice(0, 16);
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// ─── CSS class constants ──────────────────────────────────────────────────────

export const inputCls =
  'bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 w-full';

export const btnEdit =
  'text-xs px-2 py-1 rounded font-medium transition-colors border bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200';

export const btnDanger =
  'text-xs px-2 py-1 rounded font-medium transition-colors border bg-red-50 text-red-600 hover:bg-red-100 border-red-200';

export const btnPrimary =
  'text-xs px-2 py-1 rounded font-medium transition-colors border bg-red-600 text-white hover:bg-red-700 border-red-600';

export const btnSecondary =
  'text-xs px-2 py-1 rounded font-medium transition-colors border bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: Readonly<ModalProps>) {
  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-neutral-900">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: Readonly<FieldProps>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
        {label}
      </Label>
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
    <DialogFooter className="flex-col items-start gap-2 pt-4 border-t border-neutral-100 sm:flex-row sm:justify-end sm:items-center">
      {error && <p className="text-red-500 text-sm flex-1">{error}</p>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </DialogFooter>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, string> = {
  now_showing:  'bg-green-100 text-green-700 border-green-200',
  coming_soon:  'bg-blue-100 text-blue-700 border-blue-200',
  upcoming:     'bg-blue-100 text-blue-700 border-blue-200',
  ended:        'bg-neutral-100 text-neutral-500 border-neutral-200',
};

export function StatusBadge({ value }: Readonly<{ value: string }>) {
  return (
    <Badge
      variant="outline"
      className={`capitalize text-xs ${STATUS_VARIANT[value] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}
    >
      {value?.replace('_', ' ')}
    </Badge>
  );
}

// ─── Active indicator ─────────────────────────────────────────────────────────

export function ActiveIcon({ active }: Readonly<{ active: boolean }>) {
  return active
    ? <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">Yes</Badge>
    : <Badge variant="outline" className="bg-neutral-100 text-neutral-400 border-neutral-200 text-xs">No</Badge>;
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
      <div>
        <h2 className="text-neutral-900 font-semibold text-lg leading-none">
          {title}
        </h2>
        {count !== undefined && (
          <p className="text-neutral-400 text-sm mt-0.5">{count} records</p>
        )}
      </div>
      {addLabel && (
        <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm" onClick={onAdd}>
          {addLabel}
        </Button>
      )}
    </div>
  );
}

// ─── Table scaffold ───────────────────────────────────────────────────────────

export function AdminTable({ cols, children }: Readonly<{ cols: string[]; children: ReactNode }>) {
  return (
    <div className="rounded-lg border border-neutral-200 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50 hover:bg-neutral-50">
            {cols.map(col => (
              <ShadTableHead key={col} className="text-neutral-500 text-xs uppercase tracking-wide font-semibold py-3">
                {col}
              </ShadTableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Sort hook ───────────────────────────────────────────────────────────────

export interface SortState { key: string; dir: 'asc' | 'desc' }

export function useSort<T>(items: T[]) {
  const [sort, setSort] = useState<SortState | null>(null);

  function toggle(key: string) {
    if (!key) return;
    setSort(prev =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  const sorted = useMemo(() => {
    if (!sort) return items;
    return [...items].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sort.key];
      const bv = (b as Record<string, unknown>)[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [items, sort]);

  return { sorted, sort, toggle };
}

// ─── Sortable table head ──────────────────────────────────────────────────────

export interface ColDef { label: string; key: string }

export function SortableTableHead({
  cols,
  sort,
  onSort,
}: Readonly<{ cols: ColDef[]; sort: SortState | null; onSort: (key: string) => void }>) {
  return (
    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs border-b border-neutral-200">
      <tr>
        {cols.map(col => (
          <th
            key={col.label}
            onClick={() => col.key && onSort(col.key)}
            className={`px-3 py-2.5 whitespace-nowrap font-semibold tracking-wide select-none ${
              col.key ? 'cursor-pointer hover:text-neutral-800 hover:bg-neutral-100 transition-colors' : ''
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {col.label}
              {col.key && (
                sort?.key === col.key
                  ? <span className="text-red-500">{sort.dir === 'asc' ? '↑' : '↓'}</span>
                  : <span className="text-neutral-300 text-[10px]">↕</span>
              )}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Keep legacy exports for backward compatibility
export { Table, TableBody, TableRow };

// Legacy TableHead — accepts cols[] and renders a plain <thead> for sections using raw <table>
export function TableHead({ cols }: Readonly<{ cols: string[] }>) {
  return (
    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs border-b border-neutral-200">
      <tr>
        {cols.map(col => (
          <th key={col} className="px-3 py-2.5 whitespace-nowrap font-semibold tracking-wide">{col}</th>
        ))}
      </tr>
    </thead>
  );
}

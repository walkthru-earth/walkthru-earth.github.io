'use client';

import { memo, useState } from 'react';
import type { ParquetInfo } from './data/sections';

interface QueryPanelProps {
  query: string;
  duration: number | null;
  rowCount: number;
  isLoading: boolean;
  error: string | null;
}

type Token = { type: 'keyword' | 'string' | 'number' | 'text'; value: string };

function tokenizeSQL(sql: string): Token[] {
  if (!sql) return [];
  const tokens: Token[] = [];
  const pattern =
    /('(?:[^'\\]|\\.)*')|(\b(?:SELECT|FROM|WHERE|AND|OR|AS|BETWEEN|ORDER\s+BY|LIMIT|JOIN|ON|GROUP\s+BY|NULLIF|read_parquet)\b)|(\b\d+\.?\d*\b)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(sql)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: sql.slice(lastIndex, match.index) });
    }
    if (match[1]) tokens.push({ type: 'string', value: match[1] });
    else if (match[2]) tokens.push({ type: 'keyword', value: match[2] });
    else if (match[3]) tokens.push({ type: 'number', value: match[3] });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < sql.length) {
    tokens.push({ type: 'text', value: sql.slice(lastIndex) });
  }
  return tokens;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/* ── Shared Parquet sub-components ────────────────────────────────── */

function ChevronIcon({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className ?? 'text-gray-400 dark:text-white/40'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function ParquetStatsGrid({
  info,
  px = 'px-3',
  showFileSize,
}: {
  info: ParquetInfo;
  px?: string;
  showFileSize?: boolean;
}) {
  const rows: [string, string][] = [];
  if (showFileSize) rows.push(['File size', formatBytes(info.fileSize)]);
  rows.push(['Rows', info.numRows.toLocaleString()]);
  rows.push(['Row groups', String(info.numRowGroups)]);
  rows.push(['Version', String(info.parquetVersion)]);
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-1.5 ${px} py-2.5 font-mono text-[10px]`}
    >
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <div className="font-medium text-gray-500 dark:text-white/50">
            {label}
          </div>
          <div className="text-right font-bold text-gray-800 dark:text-white/90">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ParquetSchemaSection({
  info,
  px = 'px-3',
}: {
  info: ParquetInfo;
  px?: string;
}) {
  const [schemaOpen, setSchemaOpen] = useState(false);
  return (
    <div className="border-t border-black/10 dark:border-white/10">
      <button
        type="button"
        onClick={() => setSchemaOpen(!schemaOpen)}
        className={`flex w-full items-center justify-between ${px} py-2`}
      >
        <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-white/50">
          Schema ({info.columns.length} columns)
        </span>
        <ChevronIcon open={schemaOpen} />
      </button>
      {schemaOpen && (
        <div className={`overflow-hidden ${px} pb-2.5`}>
          <table className="w-full table-fixed font-mono text-[10px]">
            <thead>
              <tr className="text-gray-500 dark:text-white/50">
                <th className="w-[55%] pb-1.5 text-left font-semibold">
                  Column
                </th>
                <th className="w-[25%] pb-1.5 text-left font-semibold">Type</th>
                <th className="w-[20%] pb-1.5 text-right font-semibold">
                  Codec
                </th>
              </tr>
            </thead>
            <tbody>
              {info.columns.map((col) => (
                <tr key={col.name}>
                  <td className="truncate py-0.5 font-semibold text-gray-800 dark:text-white/85">
                    {col.name}
                  </td>
                  <td className="truncate py-0.5 text-gray-500 dark:text-white/50">
                    {col.type ?? '?'}
                  </td>
                  <td className="truncate py-0.5 text-right text-gray-400 dark:text-white/40">
                    {col.codec ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ParquetCreatedBy({
  info,
  px = 'px-3',
}: {
  info: ParquetInfo;
  px?: string;
}) {
  if (!info.createdBy) return null;
  return (
    <div
      className={`truncate border-t border-black/10 ${px} py-2 font-mono text-[10px] text-gray-400 dark:border-white/10 dark:text-white/40`}
    >
      {info.createdBy}
    </div>
  );
}

/* ── Standalone Parquet info panel (desktop, top-left floating) ───── */

export function ParquetInfoPanel({
  info,
  isLoading,
}: {
  info: ParquetInfo | null;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-18 left-4 z-20 hidden sm:top-6 sm:left-6 sm:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Parquet file info"
        aria-expanded={open}
        className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all sm:h-10 sm:w-10 ${
          open
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:border-emerald-400/50 dark:bg-emerald-400/15 dark:text-emerald-400'
            : 'border-black/10 bg-white/95 text-gray-600 hover:bg-black/5 dark:border-white/10 dark:bg-black/85 dark:text-white/60 dark:hover:bg-white/10'
        }`}
      >
        {isLoading ? (
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </button>

      {open && info && (
        <div className="mt-2 w-72 rounded-xl border border-black/10 bg-white/95 shadow-xl backdrop-blur-md sm:w-80 dark:border-white/10 dark:bg-black/85">
          <div className="flex items-center gap-2 border-b border-black/10 px-4 py-2.5 dark:border-white/10">
            <svg
              className="h-4 w-4 text-emerald-500 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="font-mono text-sm font-bold text-gray-800 dark:text-white/90">
              Parquet Metadata
            </span>
          </div>
          <ParquetStatsGrid info={info} px="px-4" showFileSize />
          <ParquetSchemaSection info={info} px="px-4" />
          <ParquetCreatedBy info={info} px="px-4" />
        </div>
      )}
    </div>
  );
}

const TOKEN_CLASSES: Record<Token['type'], string> = {
  keyword: 'text-emerald-600 dark:text-emerald-400 font-semibold',
  string: 'text-amber-600 dark:text-amber-300',
  number: 'text-sky-600 dark:text-sky-300',
  text: 'text-gray-800 dark:text-white/90',
};

/* ── Shared small components ─────────────────────────────────────── */

function SQLToggleButton({
  expanded,
  onToggle,
  isLoading,
  rowCount,
  duration,
  className,
}: {
  expanded: boolean;
  onToggle: () => void;
  isLoading: boolean;
  rowCount: number;
  duration: number | null;
  className?: string;
}) {
  return (
    <button onClick={onToggle} aria-expanded={expanded} className={className}>
      <span
        className={`inline-block h-2 w-2 rounded-full transition-colors ${
          isLoading
            ? 'animate-pulse bg-amber-500'
            : 'bg-emerald-500 dark:bg-emerald-400'
        }`}
      />
      SQL
      {isLoading && (
        <span className="animate-pulse text-amber-600 dark:text-amber-300">
          {rowCount > 0
            ? `${rowCount.toLocaleString()} rows...`
            : 'querying...'}
        </span>
      )}
      {!isLoading && duration !== null && (
        <span className="text-gray-400 dark:text-white/50">
          {duration.toFixed(0)}ms
        </span>
      )}
      <ChevronIcon open={expanded} className="" />
    </button>
  );
}

function SQLCodeBlock({ query }: { query: string }) {
  return (
    <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-gray-800 sm:p-4 dark:text-white/90">
      <code>
        {tokenizeSQL(query).map((tok, i) => (
          <span key={i} className={TOKEN_CLASSES[tok.type]}>
            {tok.value}
          </span>
        ))}
      </code>
    </pre>
  );
}

function SQLStatsBar({
  error,
  rowCount,
  duration,
}: {
  error: string | null;
  rowCount: number;
  duration: number | null;
}) {
  if (!error && rowCount === 0 && duration === null) return null;
  return (
    <div className="flex items-center gap-3 border-t border-black/10 px-3 py-2 font-mono text-[10px] text-gray-400 dark:border-white/10 dark:text-white/50">
      {error ? (
        <span className="text-red-500 dark:text-red-400">{error}</span>
      ) : (
        <>
          {rowCount > 0 && <span>{rowCount.toLocaleString()} rows</span>}
          {duration !== null && <span>{duration.toFixed(0)}ms</span>}
        </>
      )}
    </div>
  );
}

/* ── Inline SQL block (used inside mobile drawer) ─────────────────── */

export function QueryPanelInline({
  query,
  duration,
  rowCount,
  isLoading,
  error,
}: QueryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!query) return null;

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10">
      <SQLToggleButton
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        isLoading={isLoading}
        rowCount={rowCount}
        duration={duration}
        className="flex w-full items-center gap-2 px-3 py-2 font-mono text-xs text-gray-800 dark:text-white/80"
      />

      {expanded && (
        <div className="border-t border-black/10 dark:border-white/10">
          <SQLCodeBlock query={query} />
          <SQLStatsBar error={error} rowCount={rowCount} duration={duration} />
        </div>
      )}
    </div>
  );
}

/* ── Inline Parquet info (used inside mobile drawer) ──────────────── */

export function ParquetInfoInline({
  info,
  isLoading,
}: {
  info: ParquetInfo | null;
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-3 py-2 font-mono text-xs text-gray-800 dark:text-white/80"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full transition-colors ${
            isLoading
              ? 'animate-pulse bg-amber-500'
              : 'bg-sky-500 dark:bg-sky-400'
          }`}
        />
        Parquet
        {info && (
          <span className="text-gray-400 dark:text-white/50">
            {formatBytes(info.fileSize)}
          </span>
        )}
        <ChevronIcon open={expanded} className="" />
      </button>

      {expanded && info && (
        <div className="border-t border-black/10 dark:border-white/10">
          <ParquetStatsGrid info={info} />
          <ParquetSchemaSection info={info} />
          <ParquetCreatedBy info={info} />
        </div>
      )}
    </div>
  );
}

/* ── Desktop floating panel (bottom-left) ─────────────────────────── */

export const QueryPanel = memo(function QueryPanel({
  query,
  duration,
  rowCount,
  isLoading,
  error,
}: QueryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!query) return null;

  return (
    <div className="absolute bottom-4 left-8 z-20 hidden w-fit max-w-md flex-col sm:flex">
      <SQLToggleButton
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        isLoading={isLoading}
        rowCount={rowCount}
        duration={duration}
        className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white/95 px-2 py-1 font-mono text-[11px] text-gray-800 transition-colors hover:bg-white dark:border-white/10 dark:bg-black/85 dark:text-white/80 dark:hover:bg-black/90"
      />

      {/* Expanded panel (opens upward) */}
      <div
        className={`order-first mb-2 overflow-hidden rounded-lg border border-black/10 bg-white/95 transition-all duration-200 dark:border-white/10 dark:bg-black/85 ${
          expanded
            ? 'max-h-96 opacity-100'
            : 'pointer-events-none max-h-0 border-transparent opacity-0'
        }`}
      >
        <SQLCodeBlock query={query} />
        <SQLStatsBar error={error} rowCount={rowCount} duration={duration} />
      </div>
    </div>
  );
});

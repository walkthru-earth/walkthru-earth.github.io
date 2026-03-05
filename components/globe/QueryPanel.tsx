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

/* ── Standalone Parquet info panel (top-left floating) ────────────── */

export function ParquetInfoPanel({
  info,
  isLoading,
}: {
  info: ParquetInfo | null;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-20 sm:top-6 sm:left-6">
      {/* "i" toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Parquet file info"
        aria-expanded={open}
        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-md transition-all sm:h-14 sm:w-14 ${
          open
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:border-emerald-400/50 dark:bg-emerald-400/15 dark:text-emerald-400'
            : 'border-black/15 bg-white/95 text-gray-600 hover:border-black/25 hover:bg-white dark:border-white/15 dark:bg-black/85 dark:text-white/60 dark:hover:border-white/25 dark:hover:bg-black/90'
        }`}
      >
        {isLoading ? (
          <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
        ) : (
          <svg
            className="h-6 w-6 sm:h-7 sm:w-7"
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

      {/* Expanded panel */}
      {open && info && (
        <div
          className="mt-2 max-h-[60vh] w-72 overflow-y-auto overscroll-contain rounded-xl border border-black/10 bg-white/95 shadow-xl backdrop-blur-md sm:w-80 dark:border-white/10 dark:bg-black/85"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Header */}
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

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-4 py-3 font-mono text-xs">
            <div className="font-medium text-gray-500 dark:text-white/50">
              File size
            </div>
            <div className="text-right font-bold text-gray-800 dark:text-white/90">
              {formatBytes(info.fileSize)}
            </div>
            <div className="font-medium text-gray-500 dark:text-white/50">
              Rows
            </div>
            <div className="text-right font-bold text-gray-800 dark:text-white/90">
              {info.numRows.toLocaleString()}
            </div>
            <div className="font-medium text-gray-500 dark:text-white/50">
              Row groups
            </div>
            <div className="text-right font-bold text-gray-800 dark:text-white/90">
              {info.numRowGroups}
            </div>
            <div className="font-medium text-gray-500 dark:text-white/50">
              Version
            </div>
            <div className="text-right font-bold text-gray-800 dark:text-white/90">
              {info.parquetVersion}
            </div>
          </div>

          {/* Schema table */}
          <div className="border-t border-black/10 px-4 py-3 dark:border-white/10">
            <div className="mb-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-white/50">
              Schema
            </div>
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-white/50">
                  <th className="pb-1.5 text-left font-semibold">Column</th>
                  <th className="pb-1.5 text-left font-semibold">Type</th>
                  <th className="pb-1.5 text-right font-semibold">Codec</th>
                </tr>
              </thead>
              <tbody>
                {info.columns.map((col) => (
                  <tr key={col.name}>
                    <td className="py-0.5 font-semibold text-gray-800 dark:text-white/85">
                      {col.name}
                    </td>
                    <td className="py-0.5 text-gray-500 dark:text-white/50">
                      {col.type ?? '?'}
                    </td>
                    <td className="py-0.5 text-right text-gray-400 dark:text-white/40">
                      {col.codec ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Created by */}
          {info.createdBy && (
            <div className="truncate border-t border-black/10 px-4 py-2.5 font-mono text-[10px] text-gray-400 dark:border-white/10 dark:text-white/40">
              {info.createdBy}
            </div>
          )}
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
      <svg
        className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
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

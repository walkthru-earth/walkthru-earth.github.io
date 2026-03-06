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
      className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className ?? 'text-muted-foreground/70'}`}
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
      className={`grid grid-cols-2 gap-x-4 gap-y-1.5 ${px} text-2xs py-2.5 font-mono`}
    >
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <div className="text-muted-foreground font-medium">{label}</div>
          <div className="text-foreground text-right font-bold">{value}</div>
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
    <div className="border-border/50 border-t">
      <button
        type="button"
        onClick={() => setSchemaOpen(!schemaOpen)}
        className={`flex w-full items-center justify-between ${px} py-2`}
      >
        <span className="text-muted-foreground text-2xs font-bold tracking-wider uppercase">
          Schema ({info.columns.length} columns)
        </span>
        <ChevronIcon open={schemaOpen} />
      </button>
      {schemaOpen && (
        <div className={`overflow-hidden ${px} pb-2.5`}>
          <table className="text-2xs w-full table-fixed font-mono">
            <thead>
              <tr className="text-muted-foreground">
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
                  <td className="text-foreground/85 truncate py-0.5 font-semibold">
                    {col.name}
                  </td>
                  <td className="text-muted-foreground truncate py-0.5">
                    {col.type ?? '?'}
                  </td>
                  <td className="text-muted-foreground/70 truncate py-0.5 text-right">
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
      className={`text-muted-foreground/70 border-border/50 truncate border-t ${px} text-2xs py-2 font-mono`}
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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Parquet file info"
        aria-expanded={open}
        className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all sm:h-10 sm:w-10 ${
          open
            ? 'border-success-border bg-success-muted text-success'
            : 'border-border/50 bg-background/90 text-muted-foreground hover:bg-accent'
        }`}
      >
        {isLoading ? (
          <span className="bg-warning h-2.5 w-2.5 animate-pulse rounded-full" />
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
        <div className="border-border/50 bg-background/95 mt-2 w-72 rounded-xl border shadow-xl backdrop-blur-md sm:w-80">
          <div className="border-border/50 flex items-center gap-2 border-b px-4 py-2.5">
            <svg
              className="text-success h-4 w-4"
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
            <span className="text-foreground font-mono text-sm font-bold">
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
  keyword: 'text-success font-semibold',
  string: 'text-warning',
  number: 'text-info',
  text: 'text-foreground',
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
          isLoading ? 'bg-warning animate-pulse' : 'bg-success'
        }`}
      />
      SQL
      {isLoading && (
        <span className="text-warning animate-pulse">
          {rowCount > 0
            ? `${rowCount.toLocaleString()} rows...`
            : 'querying...'}
        </span>
      )}
      {!isLoading && duration !== null && (
        <span className="text-muted-foreground">{duration.toFixed(0)}ms</span>
      )}
      <ChevronIcon open={expanded} className="" />
    </button>
  );
}

function SQLCodeBlock({ query }: { query: string }) {
  return (
    <pre className="text-foreground overflow-x-auto p-3 font-mono text-xs leading-relaxed sm:p-4">
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
    <div className="text-muted-foreground border-border/50 text-2xs flex items-center gap-3 border-t px-3 py-2 font-mono">
      {error ? (
        <span className="text-error">{error}</span>
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
    <div className="border-border/50 rounded-lg border">
      <SQLToggleButton
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        isLoading={isLoading}
        rowCount={rowCount}
        duration={duration}
        className="text-foreground/80 flex w-full items-center gap-2 px-3 py-2 font-mono text-xs"
      />

      {expanded && (
        <div className="border-border/50 border-t">
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
    <div className="border-border/50 rounded-lg border">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="text-foreground/80 flex w-full items-center gap-2 px-3 py-2 font-mono text-xs"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full transition-colors ${
            isLoading ? 'bg-warning animate-pulse' : 'bg-info'
          }`}
        />
        Parquet
        {info && (
          <span className="text-muted-foreground">
            {formatBytes(info.fileSize)}
          </span>
        )}
        <ChevronIcon open={expanded} className="" />
      </button>

      {expanded && info && (
        <div className="border-border/50 border-t">
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
        className="border-border/50 bg-background/90 text-2xs text-foreground hover:bg-accent flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono transition-colors"
      />

      {/* Expanded panel (opens upward) */}
      <div
        className={`border-border/50 bg-background/95 order-first mb-2 overflow-hidden rounded-lg border transition-all duration-200 ${
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

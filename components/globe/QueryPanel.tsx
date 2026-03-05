'use client';

import { memo, useState } from 'react';

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

const TOKEN_CLASSES: Record<Token['type'], string> = {
  keyword: 'text-emerald-600 dark:text-emerald-400 font-semibold',
  string: 'text-amber-600 dark:text-amber-300',
  number: 'text-sky-600 dark:text-sky-300',
  text: '',
};

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
    <div className="absolute top-3 right-3 z-20 max-w-[calc(100vw-1rem)] sm:top-auto sm:right-4 sm:bottom-4 sm:max-w-md">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="text-foreground/80 flex items-center gap-2 rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 font-mono text-xs transition-colors hover:bg-white/90 dark:border-white/10 dark:bg-black/70 dark:hover:bg-black/80"
      >
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
          <span className="text-muted-foreground">{duration.toFixed(0)}ms</span>
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

      {/* Expanded panel */}
      <div
        className={`mt-2 overflow-hidden rounded-lg border border-black/10 bg-white/90 transition-all duration-200 dark:border-white/10 dark:bg-black/80 ${
          expanded
            ? 'max-h-96 opacity-100'
            : 'pointer-events-none max-h-0 border-transparent opacity-0'
        }`}
      >
        <pre className="text-foreground/90 overflow-x-auto p-4 font-mono text-xs leading-relaxed">
          <code>
            {tokenizeSQL(query).map((tok, i) => (
              <span key={i} className={TOKEN_CLASSES[tok.type]}>
                {tok.value}
              </span>
            ))}
          </code>
        </pre>

        {/* Stats bar */}
        <div className="text-muted-foreground flex items-center gap-3 border-t border-black/10 px-4 py-2 font-mono text-[10px] dark:border-white/10">
          {error ? (
            <span className="text-red-500 dark:text-red-400">{error}</span>
          ) : (
            <>
              {rowCount > 0 && <span>{rowCount.toLocaleString()} rows</span>}
              {duration !== null && <span>{duration.toFixed(0)}ms</span>}
              <span className="ml-auto text-emerald-600/60 dark:text-emerald-400/60">
                hyparquet
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

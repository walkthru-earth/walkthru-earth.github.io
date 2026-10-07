import { Localized } from '@/lib/i18n/i18n-provider';
import { cn } from '@/lib/utils';

/** A small, data-free illustration: observations become a shared picture of a place. */
export function EvidenceGraphic({
  variant = 'overview',
  className,
}: {
  variant?: 'overview' | 'sensing';
  className?: string;
}) {
  return (
    <Localized>
      <div className={cn('evidence-graphic', className)}>
        <div className="evidence-caption">
          <span>
            {variant === 'sensing'
              ? 'Local observations'
              : 'A shared picture of a place'}
          </span>
          <span aria-hidden="true">↗</span>
        </div>
        <svg
          viewBox="0 0 480 410"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M42 290 240 180 438 290 240 400Z"
            fill="var(--palette-surface)"
            stroke="var(--palette-border)"
          />
          <path
            d="M42 254 240 144 438 254 240 364Z"
            fill="var(--palette-accent)"
            stroke="var(--palette-deep)"
            strokeWidth="1.5"
          />
          <g stroke="var(--palette-deep)" opacity=".35">
            <path d="m92 226 198 110M141 199l198 110M190 171l198 110M92 281l198-110M141 309l198-110M190 337l198-110" />
          </g>
          <g
            className={
              variant === 'overview' ? 'brand-tone-spatial' : undefined
            }
          >
            <path
              d="m98 219 47-26 47 26v52l-47 26-47-26Z"
              fill="var(--brand-color)"
              stroke="var(--palette-deep)"
              strokeWidth="2"
            />
            <path
              d="m98 219 47 26 47-26m-47 26v52"
              stroke="var(--palette-deep)"
              strokeWidth="2"
            />
          </g>
          <g
            className={
              variant === 'overview' ? 'brand-tone-ecosystem' : undefined
            }
          >
            <path
              d="m192 141 48-27 48 27v105l-48 27-48-27Z"
              fill="var(--brand-color)"
              stroke="var(--palette-deep)"
              strokeWidth="2"
            />
            <path
              d="m192 141 48 27 48-27m-48 27v105m-32-93 17 9m-17 16 17 9m30-27 17-9m-17 34 17-9"
              stroke="var(--palette-deep)"
              strokeWidth="2"
            />
          </g>
          <g
            className={
              variant === 'overview' ? 'brand-tone-experience' : undefined
            }
          >
            <path
              d="m286 221 47-26 47 26v45l-47 26-47-26Z"
              fill="var(--brand-color)"
              stroke="var(--palette-deep)"
              strokeWidth="2"
            />
            <path
              d="m286 221 47 26 47-26m-47 26v45"
              stroke="var(--palette-deep)"
              strokeWidth="2"
            />
          </g>
          <path
            className="evidence-connection"
            d="M145 192V94Q145 74 165 74H315Q335 74 335 94v100"
            stroke="var(--palette-text)"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
          <g
            className={
              variant === 'overview' ? 'brand-tone-sensing' : undefined
            }
          >
            <circle cx="145" cy="110" r="33" fill="var(--brand-color)" />
            <circle cx="145" cy="110" r="6" fill="var(--brand-ink)" />
            <path
              d="M133 98a17 17 0 0 0 0 24m24-24a17 17 0 0 1 0 24m-30-30a25 25 0 0 0 0 36m36-36a25 25 0 0 1 0 36"
              stroke="var(--brand-ink)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <g
            className={variant === 'overview' ? 'brand-tone-action' : undefined}
          >
            <rect
              x="303"
              y="34"
              width="66"
              height="66"
              rx="22"
              fill="var(--brand-color)"
            />
            <path
              d="m321 69 10 10 20-24"
              stroke="var(--brand-ink)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <circle cx="240" cy="74" r="5" fill="var(--palette-text)" />
          <path
            d="M240 79v34"
            stroke="var(--palette-text)"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
        </svg>
        <div className="evidence-legend">
          <span>{variant === 'sensing' ? 'Sense' : 'Evidence'}</span>
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
          <span>{variant === 'sensing' ? 'Share' : 'Translation'}</span>
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
          <span>{variant === 'sensing' ? 'Understand' : 'Action'}</span>
        </div>
      </div>
    </Localized>
  );
}

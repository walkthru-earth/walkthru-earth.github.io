'use client';

import { useId, useRef, useState, type PointerEvent } from 'react';
import { Check, Layers, Radio } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';
import { cn } from '@/lib/utils';

const stages = [
  {
    label: 'Evidence',
    detail: 'Start with what people and sensors observe.',
    icon: Radio,
    tone: 'sensing',
  },
  {
    label: 'Translation',
    detail: 'Connect observations to understand a place.',
    icon: Layers,
    tone: 'ecosystem',
  },
  {
    label: 'Action',
    detail: 'Use that understanding to shape healthier places.',
    icon: Check,
    tone: 'action',
  },
] as const;

/** A visitor-controlled explanation, not a live data display. */
export function EvidenceGraphic({ className }: { className?: string }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  const descriptionId = useId();

  function respondToPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !scene.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    scene.current.style.setProperty(
      '--scene-x',
      `${((event.clientX - bounds.left) / bounds.width - 0.5) * 8}px`
    );
    scene.current.style.setProperty(
      '--scene-y',
      `${((event.clientY - bounds.top) / bounds.height - 0.5) * 6}px`
    );
  }

  function resetPointer() {
    scene.current?.style.setProperty('--scene-x', '0px');
    scene.current?.style.setProperty('--scene-y', '0px');
  }

  return (
    <div className={cn('evidence-graphic', className)} data-step={step}>
      <p className="evidence-caption">{t('A shared picture of a place')}</p>
      <div
        className="evidence-stage"
        onPointerMove={respondToPointer}
        onPointerLeave={resetPointer}
      >
        <div className="evidence-scene" ref={scene}>
          <svg
            viewBox="0 0 480 360"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="m24 244 216-120 216 120-216 120Z"
              fill="var(--palette-surface)"
              opacity=".5"
            />
            <path
              d="m40 224 200-111 200 111-200 111Z"
              fill="var(--palette-surface)"
              stroke="var(--palette-border)"
            />
            <g stroke="var(--palette-border)" opacity=".65">
              <path d="m90 196 200 111M140 168l200 111M190 140l200 111M90 252l200-111M140 280l200-111M190 307l200-111" />
            </g>
            <g
              className="evidence-network"
              key={`network-${step}`}
              stroke="var(--palette-text)"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path
                className="evidence-route"
                pathLength="1"
                d="M106 117Q106 65 240 75T374 117"
              />
              <path
                className="evidence-route"
                pathLength="1"
                d="M106 117v73m134-115v37m134 5v84"
              />
            </g>
            <g className="brand-tone-spatial">
              <path
                d="m104 192 44-25 44 25v49l-44 25-44-25Z"
                fill="var(--brand-color)"
                stroke="var(--palette-deep)"
                strokeWidth="1.5"
              />
              <path
                d="m104 192 44 25 44-25m-44 25v49"
                stroke="var(--palette-deep)"
                strokeWidth="1.5"
              />
            </g>
            <g className="brand-tone-ecosystem">
              <path
                d="m196 137 44-25 44 25v103l-44 25-44-25Z"
                fill="var(--brand-color)"
                stroke="var(--palette-deep)"
                strokeWidth="1.5"
              />
              <path
                d="m196 137 44 25 44-25m-44 25v103m-28-85 15 8m-15 17 15 8m26-24 15-8m-15 33 15-8"
                stroke="var(--palette-deep)"
                strokeWidth="1.5"
              />
            </g>
            <g className="brand-tone-experience">
              <path
                d="m292 205 40-23 40 23v43l-40 23-40-23Z"
                fill="var(--brand-color)"
                stroke="var(--palette-deep)"
                strokeWidth="1.5"
              />
              <path
                d="m292 205 40 23 40-23m-40 23v43"
                stroke="var(--palette-deep)"
                strokeWidth="1.5"
              />
            </g>
            {step === 0 && (
              <g
                key="observations"
                className="evidence-reveal brand-tone-sensing"
                stroke="var(--brand-color)"
                strokeWidth="2"
              >
                <circle className="evidence-ripple" cx="106" cy="117" r="34" />
                <circle
                  className="evidence-ripple evidence-ripple-late"
                  cx="106"
                  cy="117"
                  r="45"
                  opacity=".4"
                />
                <path
                  d="M67 167h17m-9-8v16M379 166h17m-9-8v16"
                  stroke="var(--palette-text)"
                />
                <circle
                  cx="178"
                  cy="103"
                  r="4"
                  fill="var(--brand-color)"
                  stroke="none"
                />
                <circle
                  cx="315"
                  cy="151"
                  r="4"
                  fill="var(--brand-color)"
                  stroke="none"
                />
              </g>
            )}
            {step === 1 && (
              <g
                key="connections"
                className="evidence-reveal"
                stroke="var(--palette-text)"
                strokeWidth="2"
              >
                <path
                  className="evidence-route"
                  pathLength="1"
                  d="m148 276 92 50 92-44M148 276v-10m92 60v-61m92 17v-11"
                />
                <circle cx="148" cy="276" r="4" fill="var(--palette-main)" />
                <circle cx="240" cy="326" r="4" fill="var(--palette-main)" />
                <circle cx="332" cy="282" r="4" fill="var(--palette-main)" />
              </g>
            )}
            {step === 2 && (
              <g key="places" className="evidence-reveal brand-tone-spatial">
                <path
                  d="m165 285 53-30 82 46-53 30Z"
                  fill="var(--brand-color)"
                  opacity=".5"
                />
                {[
                  { x: 85, y: 220 },
                  { x: 210, y: 286 },
                  { x: 388, y: 253 },
                ].map(({ x, y }) => (
                  <g key={x}>
                    <path
                      d={`M${x} ${y}v-25`}
                      stroke="var(--palette-text)"
                      strokeWidth="2"
                    />
                    <ellipse
                      cx={x}
                      cy={y - 30}
                      rx="12"
                      ry="17"
                      fill="var(--brand-color)"
                      stroke="var(--palette-deep)"
                      strokeWidth="1.5"
                    />
                  </g>
                ))}
                <g
                  className="brand-tone-action"
                  fill="var(--brand-color)"
                  stroke="var(--palette-text)"
                  strokeWidth="1.5"
                >
                  <circle cx="268" cy="280" r="4" />
                  <path d="M268 285v12m-5-7h10m-5 7-4 6m4-6 4 6" />
                  <circle cx="284" cy="289" r="4" />
                  <path d="M284 294v12m-5-7h10" />
                </g>
              </g>
            )}
          </svg>
          {stages.map(({ label, icon: Icon, tone }, index) => (
            <button
              key={label}
              type="button"
              className={`evidence-node evidence-node-${index} brand-tone-${tone}`}
              aria-label={t(label)}
              aria-pressed={step === index}
              aria-describedby={descriptionId}
              onClick={() => setStep(index)}
            >
              <Icon aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div
        className="evidence-controls"
        role="group"
        aria-label={t('Explore the story')}
      >
        {stages.map(({ label, tone }, index) => (
          <button
            type="button"
            key={label}
            className={`evidence-step brand-tone-${tone}`}
            aria-pressed={step === index}
            aria-describedby={descriptionId}
            onClick={() => setStep(index)}
          >
            <span className="evidence-step-number" aria-hidden="true">
              0{index + 1}
            </span>
            <span>{t(label)}</span>
          </button>
        ))}
      </div>
      <p
        className="evidence-detail"
        id={descriptionId}
        aria-live="polite"
        aria-atomic="true"
      >
        {t(stages[step].detail)}
      </p>
      <p className="evidence-hint">
        {t('Choose a step to explore · Illustrated concept')}
      </p>
    </div>
  );
}

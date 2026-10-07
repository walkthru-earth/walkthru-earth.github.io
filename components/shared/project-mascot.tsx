'use client';

import { useId, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import {
  Brain,
  CloudUpload,
  HardDrive,
  Leaf,
  MapPin,
  MessageCircle,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';

const mascotStories = {
  capybara: {
    name: 'Meet your capybara guide',
    alt: 'CapyBrain’s friendly tan capybara mascot',
    steps: [
      {
        label: 'Places',
        icon: MapPin,
        detail: 'Notice the places we move through every day.',
      },
      {
        label: 'People',
        icon: MessageCircle,
        detail: 'Make room for people’s experiences, not just measurements.',
      },
      {
        label: 'Patterns',
        icon: Brain,
        detail: 'Explore evidence with curiosity, and keep its limits in view.',
      },
    ],
  },
  peacock: {
    name: 'Meet our peacock guide',
    alt: 'OpenSensor’s blue and teal peacock mascot',
    steps: [
      {
        label: 'Sense',
        icon: Radio,
        detail: 'Observe the air and weather, wherever you are.',
      },
      {
        label: 'Save',
        icon: HardDrive,
        detail: 'Keep measurements on the device when connections disappear.',
      },
      {
        label: 'Sync',
        icon: CloudUpload,
        detail:
          'Share directly with object storage, or through a nearby phone or hub.',
      },
    ],
  },
} as const;

/** Shared character stage. Artwork, palette and narrative can be replaced independently. */
export function ProjectMascot({ kind }: { kind: keyof typeof mascotStories }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const story = mascotStories[kind];
  const ActiveIcon = story.steps[step].icon;

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !scene.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    scene.current.style.setProperty(
      '--mascot-x',
      `${((event.clientX - box.left) / box.width - 0.5) * 10}px`
    );
    scene.current.style.setProperty(
      '--mascot-y',
      `${((event.clientY - box.top) / box.height - 0.5) * 6}px`
    );
  }
  function resetPointer() {
    scene.current?.style.setProperty('--mascot-x', '0px');
    scene.current?.style.setProperty('--mascot-y', '0px');
  }

  return (
    <div className="project-mascot" data-mascot={kind} data-step={step}>
      <div className="mascot-heading">
        <p>{t(story.name)}</p>
        <button
          type="button"
          aria-label={t('Replay character animation')}
          onClick={() => setReplay((value) => value + 1)}
        >
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div
        className="mascot-stage"
        onPointerMove={trackPointer}
        onPointerLeave={resetPointer}
      >
        <svg
          className="mascot-landscape"
          viewBox="0 0 480 420"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="248" cy="212" r="159" fill="var(--palette-surface)" />
          <circle
            cx="248"
            cy="212"
            r="180"
            stroke="var(--palette-border)"
            strokeDasharray="2 10"
            opacity=".55"
          />
          <path
            d="M28 346q90-55 203-4t217-9"
            stroke="var(--palette-border)"
            strokeWidth="2"
          />
          {kind === 'capybara' ? (
            <g stroke="var(--palette-border)" strokeWidth="2">
              <path d="M47 313v-97h42v105m-31-89h9m9 0h5m-23 18h9m9 0h5m-23 18h9m9 0h5M90 304v-52h26v69" />
              <path
                d="M411 333v-83m0 47q-25-4-26-25 25 1 26 25m0-25q24-4 26-25-25 0-26 25"
                fill="var(--palette-surface)"
              />
            </g>
          ) : (
            <g stroke="var(--palette-border)" strokeWidth="2">
              <path d="M27 318q46-42 85-15M339 327q69-56 114-21" />
              <path d="M43 272h55m-47 12h32m-41 13h44M418 320v-60m-12 0h24m-12-15v15m-8-4 8 4 8-4" />
              <circle
                cx="388"
                cy="100"
                r="24"
                fill="var(--palette-accent)"
                stroke="none"
                opacity=".65"
              />
            </g>
          )}
          <ellipse
            cx="245"
            cy="365"
            rx="123"
            ry="14"
            fill="var(--palette-deep)"
            opacity=".12"
          />
          <g
            key={`${step}-${replay}`}
            className="mascot-trails"
            stroke="var(--palette-emphasis)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path
              className="mascot-trail"
              pathLength="1"
              d={
                step === 0
                  ? 'M82 175Q38 108 95 90'
                  : step === 1
                    ? 'M390 210q50-24 26-82'
                    : 'M93 112Q228-14 352 92'
              }
            />
            <circle
              className="mascot-spark"
              cx={step === 1 ? 416 : 95}
              cy={step === 1 ? 128 : 90}
              r="5"
              fill="var(--palette-main)"
              stroke="none"
            />
          </g>
        </svg>
        <div className="mascot-character-position" ref={scene}>
          <div className="mascot-character" key={`${kind}-${step}-${replay}`}>
            <Image
              src={`/mascots/${kind}.webp`}
              alt={t(story.alt)}
              width={768}
              height={768}
              sizes="(min-width: 1024px) 360px, 75vw"
              priority
              draggable={false}
            />
          </div>
        </div>
        <div
          className="mascot-thought"
          key={`thought-${step}-${replay}`}
          aria-hidden="true"
        >
          <ActiveIcon />
          <span>{t(story.steps[step].label)}</span>
        </div>
        <span className="mascot-leaf" aria-hidden="true">
          <Leaf />
        </span>
      </div>
      <div
        className="mascot-controls"
        role="group"
        aria-label={t('Explore with our guide')}
      >
        {story.steps.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={step === index}
            aria-describedby={descriptionId}
            onClick={() => setStep(index)}
          >
            <Icon aria-hidden="true" />
            {t(label)}
          </button>
        ))}
      </div>
      <p
        className="mascot-description"
        id={descriptionId}
        aria-live="polite"
        aria-atomic="true"
      >
        {t(story.steps[step].detail)}
      </p>
    </div>
  );
}

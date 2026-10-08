'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Radio,
  FileText,
  Cloud,
  ChartLine,
  ServerOff,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { brandPalettes } from '@/lib/brand';
import { useI18n } from '@/lib/i18n/i18n-provider';
import { SensorFlow } from '../sensor-flow';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  diagramWords,
  storyChapters,
  storyUi,
  storySummary,
} from './story-copy';
import styles from './sensor-story.module.css';

const DURATION = 65;
const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Native scrolling seeks a local HyperFrames composition. No gesture capture. */
export function SensorStory() {
  const { locale } = useI18n();
  const { resolvedTheme } = useTheme();
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const progress = useRef(0);
  const reduced = useRef(false);
  const [chapter, setChapter] = useState(0);
  const [cadence, setCadence] = useState<15 | 60>(15);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const copy = storyChapters[chapter];
  const ui = (key: keyof typeof storyUi) => storyUi[key][locale];

  const seek = useCallback(() => {
    if (!section.current || !frame.current?.contentWindow) return;
    const time = 2 + progress.current * DURATION;
    const color = getComputedStyle(section.current);
    frame.current.contentWindow.postMessage(
      {
        type: 'opensensor-frame',
        time: reduced.current ? Math.floor(time / 10) * 10 + 3 : time,
        colors: {
          ...Object.fromEntries(
            [
              'paper',
              'surface',
              'text',
              'muted',
              'emphasis',
              'border',
              'accent',
            ].map((key) => [
              key,
              color.getPropertyValue(`--palette-${key}`).trim(),
            ])
          ),
          removal:
            resolvedTheme === 'dark'
              ? brandPalettes.experience.dark.main
              : brandPalettes.experience.light.deep,
          contribution:
            resolvedTheme === 'dark'
              ? brandPalettes.action.dark.main
              : brandPalettes.action.light.deep,
        },
        labels: Object.fromEntries(
          Object.entries(diagramWords).map(([key, value]) => [
            key,
            value[locale],
          ])
        ),
        locale,
        cadence,
      },
      window.location.origin
    );
  }, [cadence, locale, resolvedTheme]);

  useEffect(() => {
    const acknowledge = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === 'opensensor-ready'
      ) {
        setReady(true);
        setFailed(false);
        seek();
      }
    };
    window.addEventListener('message', acknowledge);
    seek();
    return () => window.removeEventListener('message', acknowledge);
  }, [seek, revision]);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    let raf = 0;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      raf = 0;
      if (window.innerHeight <= 720) {
        seek();
        return;
      }
      const rect = element.getBoundingClientRect();
      progress.current = clamp(
        -rect.top / Math.max(1, rect.height - window.innerHeight)
      );
      setChapter(
        Math.min(6, Math.floor((2 + progress.current * DURATION) / 10))
      );
      seek();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const motion = () => {
      reduced.current = media.matches;
      schedule();
    };
    motion();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    media.addEventListener('change', motion);
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      media.removeEventListener('change', motion);
    };
  }, [seek]);

  useEffect(() => {
    seek();
  }, [resolvedTheme, ready, seek]);
  useEffect(() => {
    if (ready) return;
    const timeout = window.setTimeout(() => setFailed(true), 12000);
    return () => window.clearTimeout(timeout);
  }, [ready, revision]);

  const goTo = (index: number) => {
    const element = section.current;
    if (!element || index < 0 || index >= storyChapters.length) return;
    setAnnouncement(
      `${index + 1} / ${storyChapters.length}. ${storyChapters[index].title[locale]}`
    );
    if (window.innerHeight <= 720) {
      progress.current = (index * 10) / DURATION;
      setChapter(index);
      element.scrollIntoView({ block: 'start', behavior: 'instant' });
      seek();
      return;
    }
    const top = element.getBoundingClientRect().top + window.scrollY;
    // Native navigation remains usable with reduced motion and keyboard input.
    window.scrollTo({
      top:
        top +
        ((index * 10) / DURATION) * (element.offsetHeight - window.innerHeight),
      behavior: 'instant',
    });
  };

  return (
    <>
      <section
        ref={section}
        id="sensor-story"
        className={styles.story}
        aria-label={ui('sectionLabel')}
      >
        <div className={styles.stage} data-chapter={chapter}>
          <header className={styles.header}>
            <span className={styles.context} data-old={chapter === 0}>
              {copy.label[locale]}
            </span>
            <div className={styles.actions}>
              <Dialog>
                <DialogTrigger className={styles.tryConnection}>
                  {ui('tryConnections')}
                </DialogTrigger>
                <DialogContent
                  className={`brand-project-opensensor ${styles.connectionModal}`}
                >
                  <DialogTitle>{ui('tryConnections')}</DialogTitle>
                  <DialogDescription className="sr-only">
                    {storyChapters[1].body[locale]}
                  </DialogDescription>
                  <SensorFlow compact />
                </DialogContent>
              </Dialog>
              <a href="#sensor-story-details" className={styles.skip}>
                {ui('skip')} <ArrowDown size={14} aria-hidden="true" />
              </a>
            </div>
          </header>
          <div className={styles.visual}>
            <iframe
              key={revision}
              ref={frame}
              src="/opensensor-story/index.html"
              title={ui('diagram')}
              tabIndex={-1}
              aria-hidden="true"
              loading="lazy"
              onLoad={() => {
                const child = frame.current?.contentWindow as
                  (Window & { __timelines?: Record<string, unknown> }) | null;
                const loaded = Boolean(child?.__timelines?.opensensor);
                setReady(loaded);
                setFailed(!loaded);
                seek();
              }}
            />
            {!ready && (
              <div className={styles.fallback}>
                <span>{ui('fallback')}</span>
                {failed && (
                  <button
                    type="button"
                    onClick={() => {
                      setFailed(false);
                      setRevision((value) => value + 1);
                    }}
                  >
                    {ui('refresh')}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className={styles.caption}>
            <div className={styles.narrative}>
              {storyChapters.map((item, index) => (
                <div
                  key={item.label.en}
                  className={styles.narrativeMoment}
                  data-active={index === chapter}
                  aria-hidden={index !== chapter}
                >
                  <h3>{item.title[locale]}</h3>
                  <p>{item.body[locale]}</p>
                </div>
              ))}
            </div>
            <div className={styles.captionAside}>
              {chapter === 2 ? (
                <div className={styles.cadence}>
                  <div
                    role="group"
                    aria-label={ui('cadence')}
                    className={styles.toggle}
                  >
                    <button
                      type="button"
                      aria-pressed={cadence === 15}
                      onClick={() => setCadence(15)}
                    >
                      {ui('quarter')}
                    </button>
                    <button
                      type="button"
                      aria-pressed={cadence === 60}
                      onClick={() => setCadence(60)}
                    >
                      {ui('hour')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className={styles.status}>
                  {chapter === 0 ? ui('illustrative') : ui('status')}
                </p>
              )}
            </div>
          </div>
          <footer className={styles.controls}>
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {announcement}
            </span>
            <button
              type="button"
              aria-label={ui('previous')}
              onClick={() => goTo(chapter - 1)}
              disabled={chapter === 0}
            >
              <ArrowLeft
                className="rtl:rotate-180"
                size={20}
                aria-hidden="true"
              />
            </button>
            <nav aria-label={ui('chapters')}>
              {storyChapters.map((item, index) => (
                <button
                  key={item.label.en}
                  type="button"
                  aria-label={item.label[locale]}
                  aria-current={index === chapter ? 'step' : undefined}
                  onClick={() => goTo(index)}
                >
                  <span className={styles.track} />
                </button>
              ))}
            </nav>
            <button
              type="button"
              aria-label={ui('next')}
              onClick={() => goTo(chapter + 1)}
              disabled={chapter === 6}
            >
              <ArrowRight
                className="rtl:rotate-180"
                size={20}
                aria-hidden="true"
              />
            </button>
            <span className={styles.scrollHint}>{ui('scrollHintSmall')}</span>
            <span className={styles.shortHint}>{ui('shortHint')}</span>
          </footer>
        </div>
      </section>
      <div id="sensor-story-details" className={styles.details}>
        <p className={styles.summaryLabel}>{ui('summary')}</p>
        <ol className={styles.summaryPath}>
          {[Radio, FileText, Cloud, ChartLine].map((Icon, index) => (
            <li key={storySummary[index].title.en}>
              <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
              <strong>{storySummary[index].title[locale]}</strong>
              <span>{storySummary[index].hint[locale]}</span>
              {index < 3 && (
                <ArrowRight
                  className={styles.summaryArrow}
                  size={18}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
        <p className={styles.summaryBenefit}>
          <ServerOff size={18} aria-hidden="true" /> {ui('summaryBenefit')}
        </p>
      </div>
    </>
  );
}

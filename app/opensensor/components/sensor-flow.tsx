'use client';

import { useId, useState } from 'react';
import {
  Bluetooth,
  Check,
  Cloud,
  File,
  HardDrive,
  Laptop,
  Radio,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';

const connections = [
  {
    id: 'offline',
    label: 'Offline',
    icon: WifiOff,
    title: 'Connection lost. Measurements kept.',
    detail:
      'The edge device keeps recording to local Parquet files. Transfers wait for a connection; collection carries on.',
  },
  {
    id: 'local',
    label: 'Phone / hub',
    icon: Bluetooth,
    title: 'A nearby connection is enough.',
    detail:
      'Sync over Bluetooth to a phone, or over the local network to a hub. Read and analyse files locally, without an internet connection.',
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: Wifi,
    title: 'Stored locally. Shared when connected.',
    detail:
      'Upload directly, or relay through a phone or hub. Partitioned Parquet in object storage is ready for public, direct reads by browsers and apps.',
  },
] as const;

/** A conceptual connection selector. Never makes device or network requests. */
export function SensorFlow({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [mode, setMode] =
    useState<(typeof connections)[number]['id']>('offline');
  const descriptionId = useId();
  const selection = connections.find((connection) => connection.id === mode)!;
  const connected = mode !== 'offline';
  const online = mode === 'internet';
  const local = mode === 'local';

  return (
    <div
      className="sensor-flow"
      data-connection={mode}
      data-layout={compact ? 'compact' : 'default'}
    >
      <p className="evidence-caption">
        {t('Keep measuring. Sync when ready.')}
      </p>
      <div
        className="sensor-modes"
        role="group"
        aria-label={t('Try a connection scenario')}
      >
        {connections.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            aria-pressed={mode === id}
            aria-describedby={descriptionId}
            onClick={() => setMode(id)}
          >
            <Icon aria-hidden="true" />
            {t(label)}
          </button>
        ))}
      </div>
      <div className="sensor-network">
        <svg
          className="sensor-routes"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
          focusable="false"
          key={mode}
        >
          <path
            className={local ? 'sensor-route-active' : undefined}
            pathLength="1"
            d="M43 24H57m-3-2 3 2-3 2"
          />
          <path
            className={online ? 'sensor-route-active' : undefined}
            pathLength="1"
            d="M57 76H43m3-2-3 2 3 2"
          />
          {online && (
            <path
              className="sensor-route-active"
              pathLength="1"
              d="M23 43v7H77v7m-2-3 2 3 2-3"
            />
          )}
          {mode === 'local' && (
            <path
              className="sensor-route-active"
              pathLength="1"
              d="M77 43v7H23v7m-2-3 2 3 2-3"
            />
          )}
        </svg>
        {connected && (
          <span className="sensor-route-label">
            {t(online ? 'Direct upload' : 'Local sync')}
          </span>
        )}
        <div className="sensor-node sensor-edge" data-active="true">
          <div className="sensor-node-heading">
            <Radio aria-hidden="true" />
            <h3>{t('Edge device')}</h3>
          </div>
          <p>{t('Sensor → local Parquet')}</p>
          <div className="sensor-files" aria-hidden="true">
            {[0, 1, 2].map((file) => (
              <span key={file}>
                <File />
                <span>.parquet</span>
                <Check />
              </span>
            ))}
          </div>
          <span className="sensor-retained">
            <HardDrive aria-hidden="true" />
            {t('Saved on device')}
          </span>
        </div>
        <div className="sensor-node sensor-relay" data-active={local}>
          <div className="sensor-node-heading">
            <Smartphone aria-hidden="true" />
            <h3>{t('Phone or local hub')}</h3>
          </div>
          <p>{t('Bluetooth · local network')}</p>
          <span className="sensor-node-note">
            {t(
              local
                ? 'Sync available'
                : online
                  ? 'Optional relay'
                  : 'Waiting to sync'
            )}
          </span>
          <p>{t('Works without internet')}</p>
        </div>
        <div className="sensor-node sensor-client" data-active={connected}>
          <div className="sensor-node-heading">
            <Laptop aria-hidden="true" />
            <h3>{t('Browser / app')}</h3>
          </div>
          <p>
            {t(online ? 'Read shared files directly' : 'Analyse local files')}
          </p>
          <svg
            viewBox="0 0 130 30"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M0 28h130" stroke="var(--palette-border)" />
            <path
              className={connected ? 'sensor-route-active' : undefined}
              pathLength="1"
              d="m2 23 18-5 18 4 18-13 18 6 18-10 18 5 18-7"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="sensor-node sensor-store" data-active={online}>
          <div className="sensor-node-heading">
            <Cloud aria-hidden="true" />
            <h3>{t('Object storage')}</h3>
          </div>
          <p>{t('Partitioned Parquet')}</p>
          <span className="sensor-node-note">
            {t(online ? 'Public · no sign-in' : 'Internet optional')}
          </span>
          <p>{t('Direct reads, fewer services')}</p>
        </div>
      </div>
      <div
        className="sensor-explanation"
        id={descriptionId}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="font-bold">{t(selection.title)}</p>
        <p>{t(selection.detail)}</p>
      </div>
      <p className="evidence-hint">
        {t('Choose a connection · Illustrated architecture')}
      </p>
    </div>
  );
}

'use client';

import { useId, useState } from 'react';
import {
  AudioLines,
  Bluetooth,
  Check,
  ChevronDown,
  Clock3,
  File,
  Flame,
  HardDrive,
  Leaf,
  Radio,
  Sun,
  Wind,
  Wifi,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';
import {
  hardwareCopy as copy,
  hardwareModules,
  type HardwareModuleId,
} from './hardware-copy';
import styles from './hardware.module.css';

const icons = {
  air: Wind,
  soil: Leaf,
  gas: Flame,
  light: Sun,
  sound: AudioLines,
};

/** Conceptual module explorer. Selection never connects to or configures hardware. */
export function HardwareExplorer() {
  const { locale } = useI18n();
  const [selected, setSelected] = useState<HardwareModuleId>('air');
  const panelId = useId();
  const titleId = useId();
  const selectedModule = hardwareModules.find(({ id }) => id === selected)!;
  const ModuleIcon = icons[selected];

  return (
    <section
      id="sensor-hardware"
      className={styles.explorer}
      aria-labelledby={titleId}
      dir={locale === 'en' ? 'ltr' : 'rtl'}
    >
      <div className={styles.heading}>
        <h2 id={titleId}>{copy.title[locale]}</h2>
        <p>{copy.intro[locale]}</p>
      </div>
      <div
        className={styles.selector}
        role="group"
        aria-label={copy.choose[locale]}
      >
        {hardwareModules.map(({ id, label }) => {
          const Icon = icons[id];
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected === id}
              aria-controls={panelId}
              onClick={() => setSelected(id)}
            >
              <Icon aria-hidden="true" />
              {label[locale]}
            </button>
          );
        })}
      </div>

      <div className={styles.diagram} data-module={selected}>
        <div
          className={styles.module}
          id={panelId}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className={styles.moduleHead}>
            <span className={styles.moduleIcon}>
              <ModuleIcon aria-hidden="true" />
            </span>
            <span className={styles.state} data-planned={selected !== 'air'}>
              {selected === 'air'
                ? copy.prototype[locale]
                : copy.roadmap[locale]}
            </span>
          </div>
          <h3>{selectedModule.name[locale]}</h3>
          <p className={styles.moduleDetail}>{selectedModule.detail[locale]}</p>
          <div className={styles.measurements} key={selected}>
            {selectedModule.groups.map((group, index) => (
              <div className={styles.measurement} key={index}>
                <span>{group.label[locale]}</span>
                <strong dir="ltr">
                  {group.value}
                  {group.unit && <small>{group.unit}</small>}
                </strong>
              </div>
            ))}
          </div>
          <p className={styles.interface}>{selectedModule.interface[locale]}</p>
        </div>

        <div className={styles.inputTrace} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.boardWrap}>
          <span className={styles.boardCaption}>{copy.core[locale]}</span>
          <div
            className={styles.board}
            role="img"
            aria-label={`${copy.base[locale]} ESP32-S3 · Wi-Fi · Bluetooth`}
          >
            <span className={`${styles.mount} ${styles.topStart}`} />
            <span className={`${styles.mount} ${styles.topEnd}`} />
            <span className={`${styles.mount} ${styles.bottomStart}`} />
            <span className={`${styles.mount} ${styles.bottomEnd}`} />
            <div className={styles.silk}>
              <span>OPENSENSOR</span>
              <span>{copy.base[locale]}</span>
            </div>
            <svg
              className={styles.traces}
              viewBox="0 0 360 250"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path d="M0 85H62L93 116H132M0 101H52L91 140H132M0 118H45L77 164H132M228 116H260L289 85H360M228 140H275L301 111H360M228 162H281L310 191H360M159 200V223H73V250M184 200V235H264V250M209 200V219H292" />
              <circle cx="62" cy="85" r="3" />
              <circle cx="275" cy="140" r="3" />
              <circle cx="292" cy="219" r="3" />
            </svg>
            <div
              className={styles.pinRail}
              data-side="start"
              aria-hidden="true"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <div className={styles.chip} dir="ltr">
              <span className={styles.antenna} aria-hidden="true" />
              <span className={styles.chipBrand}>ESPRESSIF</span>
              <strong>ESP32-S3</strong>
              <span className={styles.chipLines} aria-hidden="true" />
            </div>
            <div className={styles.pinRail} data-side="end" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <span className={styles.port} aria-hidden="true" />
            <div className={styles.native}>
              <span>
                <Wifi aria-hidden="true" />
                <bdi>Wi-Fi</bdi>
              </span>
              <span>
                <Bluetooth aria-hidden="true" />
                <bdi>BLE</bdi>
              </span>
              <small>{copy.builtIn[locale]}</small>
            </div>
          </div>
          <p className={styles.architecture}>{copy.architecture[locale]}</p>
        </div>

        <div className={styles.outputTrace} aria-hidden="true">
          <span />
          <span />
        </div>
        <div className={styles.coreParts}>
          <div className={styles.corePart}>
            <Clock3 aria-hidden="true" className={styles.partIcon} />
            <div>
              <h3>{copy.time[locale]}</h3>
              <p>{copy.timeDetail[locale]}</p>
              <small>{copy.timeNote[locale]}</small>
            </div>
          </div>
          <div className={styles.corePart}>
            <HardDrive aria-hidden="true" className={styles.partIcon} />
            <div>
              <h3>
                <bdi>{copy.storage[locale]}</bdi>
              </h3>
              <p>{copy.storageDetail[locale]}</p>
              <span className={styles.file}>
                <File aria-hidden="true" />
                <bdi>.parquet</bdi>
                <Check aria-hidden="true" />
              </span>
              <small>{copy.local[locale]}</small>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.radios}>
        <span>
          <Radio aria-hidden="true" />
          {copy.external[locale]}
        </span>
        <div dir="ltr">
          <span>LoRa</span>
          <span>Zigbee</span>
          <span>Z-Wave</span>
        </div>
      </div>
      <div className={styles.notes}>
        <p>{copy.tested[locale]}</p>
        <p>{copy.candidates[locale]}</p>
        <p>{copy.prototypeNote[locale]}</p>
        <p className={styles.compatibility}>{copy.compatibility[locale]}</p>
      </div>
      <details className={styles.airgap}>
        <summary>
          {copy.airgap[locale]}
          <ChevronDown aria-hidden="true" />
        </summary>
        <p>{copy.airgapNote[locale]}</p>
      </details>
    </section>
  );
}

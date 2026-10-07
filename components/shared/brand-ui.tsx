'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Localized } from '@/lib/i18n/i18n-provider';
import type { ProjectBrand } from '@/lib/brand';

export type BrandTone =
  'green' | 'amber' | 'blue' | 'coral' | 'ink' | ProjectBrand;

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  tone?: BrandTone;
  children: ReactNode;
};

/** Opt editorial routes into the shared type scale without resizing data UI. */
export function BrandPage({
  className,
  project,
  ...props
}: HTMLAttributes<HTMLElement> & { project?: ProjectBrand }) {
  return (
    <main
      className={cn(
        'brand-page',
        project && `brand-project-${project}`,
        className
      )}
      {...props}
    />
  );
}

/** A solid, contrast-aware hero. Existing media or interactive children stay owned by the route. */
export function BrandHero({
  tone = 'green',
  decorative = true,
  className,
  children,
  ...props
}: SurfaceProps & { decorative?: boolean }) {
  return (
    <section
      className={cn('brand-hero', `brand-tone-${tone}`, className)}
      {...props}
    >
      {decorative && (
        <div className="brand-hero-art" aria-hidden="true">
          <span className="brand-orbit" />
          <span className="brand-spark" />
        </div>
      )}
      <div className="brand-hero-content">{children}</div>
    </section>
  );
}

/** Route sections can share a colored surface while keeping their own container. */
export function BrandSection({
  tone,
  className,
  children,
  ...props
}: Omit<SurfaceProps, 'tone'> & { tone?: BrandTone }) {
  return (
    <section
      className={cn(
        'brand-section',
        tone && ['brand-solid', `brand-tone-${tone}`],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function BrandPanel({
  tone,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: BrandTone; children: ReactNode }) {
  return (
    <div
      className={cn(
        'brand-panel',
        tone && ['brand-solid', `brand-tone-${tone}`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BrandIcon({
  tone = 'green',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BrandTone }) {
  return (
    <span
      className={cn('brand-icon', `brand-tone-${tone}`, className)}
      {...props}
    />
  );
}

export function BrandEyebrow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Localized>
      <p className={cn('brand-eyebrow', className)} {...props}>
        {children}
      </p>
    </Localized>
  );
}

export function BrandSectionHeading({
  title,
  description,
  eyebrow,
  align = 'start',
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
}) {
  return (
    <Localized>
      <div
        className={cn(
          'brand-section-heading',
          align === 'center' && 'mx-auto text-center',
          className
        )}
      >
        {eyebrow && <BrandEyebrow>{eyebrow}</BrandEyebrow>}
        <h2>{title}</h2>
        {description && (
          <p className="mt-5 text-xl leading-relaxed">{description}</p>
        )}
      </div>
    </Localized>
  );
}

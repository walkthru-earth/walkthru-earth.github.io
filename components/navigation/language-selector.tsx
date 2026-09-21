'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n/i18n-provider';
import type { Locale } from '@/lib/i18n/types';

const options: { value: Locale; label: string; shortLabel: string }[] = [
  { value: 'en', label: 'English', shortLabel: 'EN' },
  { value: 'ar-EG', label: 'العربية المصرية', shortLabel: 'مصري' },
  { value: 'ar', label: 'العربية الفصحى', shortLabel: 'عربي' },
];

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, direction, t } = useI18n();
  const current =
    options.find((option) => option.value === locale) ?? options[0];

  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          className={compact ? undefined : 'gap-2'}
          aria-label={t('Choose language')}
        >
          <Languages className="h-4 w-4" />
          {!compact && <span>{current.shortLabel}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as Locale)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              lang={option.value}
              dir={option.value === 'en' ? 'ltr' : 'rtl'}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

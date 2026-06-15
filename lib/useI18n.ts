// lib/useI18n.ts
'use client';

import { useMemo } from 'react';
import { getLocale, getTranslations } from './i18n';

export function useI18n() {
  const locale = useMemo(() => getLocale(), []);
  const t = useMemo(() => getTranslations(locale), [locale]);

  return { locale, t };
}

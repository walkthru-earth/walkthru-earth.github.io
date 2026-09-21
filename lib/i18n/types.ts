export type Locale = 'en' | 'ar-EG' | 'ar';

export type ArabicTranslation = {
  arEG: string;
  ar: string;
};

export type MessageCatalog = Record<string, ArabicTranslation>;

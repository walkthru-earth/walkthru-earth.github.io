import type { MessageCatalog } from './types';

const phrase = (ar: string, arEG = ar) => ({ ar, arEG });

export const linkMessages: MessageCatalog = {
  Website: phrase('الموقع'),
  'Our main website': phrase('موقعنا الرئيسي'),
  'Hormones & Cities': phrase('Hormones & Cities'),
  'Urban environments and wellbeing research': phrase(
    'بحث في البيئات الحضرية وجودة الحياة',
    'بحث عن البيئة الحضرية وجودة الحياة'
  ),
  'Open Data': phrase('البيانات المفتوحة'),
  'Datasets on Source Cooperative': phrase(
    'مجموعات البيانات على Source Cooperative'
  ),
  Presentations: phrase('العروض التقديمية'),
  'Our talks and slides': phrase('محاضراتنا وعروضنا'),
  'People-first urban intelligence': phrase(
    'فهم حضري يضع الناس أولًا',
    'فهم للمدن بيحط الناس في الأول'
  ),
  'Follow us': phrase('تابعنا'),
  'Cities built for people': phrase(
    'مدن مبنية من أجل الناس',
    'مدن معمولة للناس'
  ),
};

import type { MessageCatalog } from './types';

const phrase = (ar: string, arEG = ar) => ({ ar, arEG });

export const linkMessages: MessageCatalog = {
  'Loading profile…': phrase(
    'جارٍ تحميل الملف الشخصي…',
    'بنحمّل الملف الشخصي…'
  ),
  'walkthru.earth home': phrase('الصفحة الرئيسية لـ walkthru.earth'),
  'Youssef Harby': phrase('يوسف حربي'),
  'Mishka Mendbayar': phrase('ميشكا مندبايار'),
  'Myagmarjargal Mendbayar (Mishka)': phrase('مياغمارجارغال مندبايار (ميشكا)'),
  'CEO / Co-Founder': phrase('الرئيس التنفيذي / شريك مؤسس'),
  'CTO / Co-Founder': phrase('الرئيس التنفيذي للتكنولوجيا / شريك مؤسس'),
  'Chat on WhatsApp': phrase('تواصل عبر واتساب', 'كلّمنا على واتساب'),
  'Hello!': phrase('مرحبًا!', 'أهلًا!'),
  'Hello Mishka!': phrase('مرحبًا ميشكا!', 'أهلًا يا ميشكا!'),
  'Hello Youssef!': phrase('مرحبًا يوسف!', 'أهلًا يا يوسف!'),
  Website: phrase('الموقع'),
  'Our main website': phrase('موقعنا الرئيسي'),
  CapyBrain: phrase('CapyBrain'),
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

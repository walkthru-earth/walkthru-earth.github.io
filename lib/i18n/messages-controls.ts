const phrase = (ar: string, arEG = ar) => ({ ar, arEG });

export const controlsMessages: Record<string, { ar: string; arEG: string }> = {
  Close: phrase('إغلاق', 'اقفل'),
  'Toggle theme': phrase('تغيير المظهر', 'غيّر شكل الموقع'),
  Light: phrase('فاتح'),
  Dark: phrase('داكن', 'غامق'),
  System: phrase('حسب إعدادات الجهاز', 'زي إعدادات الجهاز'),
  'We use analytics cookies to understand how you use our site.': phrase(
    'نستخدم ملفات تعريف الارتباط للتحليلات لفهم كيفية استخدامك لموقعنا.',
    'بنستخدم ملفات تعريف الارتباط للتحليلات عشان نفهم استخدامك للموقع.'
  ),
  Settings: phrase('الإعدادات'),
  Reject: phrase('رفض', 'ارفض'),
  Accept: phrase('قبول', 'وافق'),
  'Cookie Preferences': phrase(
    'تفضيلات ملفات تعريف الارتباط',
    'إعدادات ملفات تعريف الارتباط'
  ),
  'Manage your cookie preferences. You can enable or disable different types of cookies below.':
    phrase(
      'أدر تفضيلات ملفات تعريف الارتباط. يمكنك تفعيل الأنواع المختلفة أو تعطيلها أدناه.',
      'اختار إعدادات ملفات تعريف الارتباط. تقدر تشغّل أو توقف الأنواع المختلفة من هنا.'
    ),
  'Essential Cookies': phrase('ملفات تعريف الارتباط الأساسية'),
  'Required for the website to function properly. These cannot be disabled.':
    phrase(
      'ضرورية لعمل الموقع بشكل سليم، ولا يمكن تعطيلها.',
      'ضرورية عشان الموقع يشتغل صح، ومينفعش تتوقف.'
    ),
  'Essential cookies (always enabled)': phrase(
    'ملفات تعريف الارتباط الأساسية (مفعّلة دائمًا)',
    'ملفات تعريف الارتباط الأساسية (شغّالة دايمًا)'
  ),
  'Analytics Cookies': phrase('ملفات تعريف الارتباط للتحليلات'),
  'Help us understand how visitors interact with our website by collecting anonymous information.':
    phrase(
      'تساعدنا على فهم تفاعل الزوار مع موقعنا بجمع معلومات مجهولة الهوية.',
      'بتساعدنا نفهم تفاعل الزوار مع الموقع عن طريق جمع معلومات مجهولة الهوية.'
    ),
  'Toggle analytics cookies': phrase(
    'تفعيل ملفات تعريف الارتباط للتحليلات أو تعطيلها',
    'شغّل أو وقف ملفات تعريف الارتباط للتحليلات'
  ),
  'Reject All': phrase('رفض الكل', 'ارفض الكل'),
  'Save Preferences': phrase('حفظ التفضيلات', 'احفظ اختياراتك'),
};

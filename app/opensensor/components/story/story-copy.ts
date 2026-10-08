import type { Locale } from '@/lib/i18n/types';

const words = (en: string, ar: string, eg = ar): Record<Locale, string> => ({
  en,
  ar,
  'ar-EG': eg,
});
export const storyChapters = [
  {
    label: words('The usual setup', 'المنظومة المعتادة', 'الطريقة المعتادة'),
    title: words(
      'A server waits for every reading.',
      'خادم ينتظر كل قراءة جديدة.',
      'سيرفر مستني كل قراءة جديدة.'
    ),
    body: words(
      'Readings pass through a receiving server, database and API before reaching your screen.',
      'تمرّ القراءات بخادم استقبال وقاعدة بيانات وواجهة API قبل وصولها إلى شاشتك.',
      'القراءات بتعدّي على سيرفر استقبال وقاعدة بيانات وواجهة API قبل ما توصل لشاشتك.'
    ),
    note: words(
      'Illustrative architecture. Some providers already use event-driven services.',
      'رسم توضيحي؛ يستخدم بعض المزوّدين بالفعل خدمات تعمل عند وقوع الأحداث.',
      'ده نموذج توضيحي. فيه مزوّدين بيستخدموا خدمات بتشتغل عند الحاجة بالفعل.'
    ),
  },
  {
    label: words(
      'Start at the sensor',
      'البداية عند المستشعر',
      'نبدأ من المستشعر'
    ),
    title: words(
      'Save the reading right here.',
      'احفظ القراءة هنا على الجهاز.',
      'نحفظ القراءة هنا على الجهاز.'
    ),
    body: words(
      'Save readings in an analysis-ready Parquet file. Saved files remain on the device when the connection drops.',
      'احفظ القراءات في ملف Parquet جاهز للتحليل. تبقى الملفات المحفوظة عند انقطاع الاتصال.',
      'نحفظ القراءات في ملف Parquet جاهز للتحليل. الملفات المحفوظة بتفضل موجودة لو الاتصال قطع.'
    ),
    note: words(
      'On-device Parquet is demonstrated. Unfinished in-memory readings can still be lost on reset.',
      'تم إثبات كتابة Parquet على الجهاز. قد تضيع القراءات غير المحفوظة في الذاكرة عند إعادة التشغيل.',
      'كتابة Parquet على الجهاز اتجرّبت. القراءات اللي لسه في الذاكرة ممكن تضيع لو الجهاز أعاد التشغيل.'
    ),
  },
  {
    label: words('Batch the journey', 'انقل على دفعات', 'نبعت على دفعات'),
    title: words(
      'Send a batch when ready.',
      'أرسل دفعة عندما تكون جاهزة.',
      'نبعت دفعة لما تكون جاهزة.'
    ),
    body: words(
      'Make a file every 15 minutes or every hour. Send it when connected; keep every individual reading.',
      'أنشئ ملفًا كل 15 دقيقة أو كل ساعة. أرسله عند الاتصال مع الاحتفاظ بكل قراءة.',
      'نعمل ملف كل 15 دقيقة أو كل ساعة. نبعته وقت الاتصال، وكل قراءة تفضل موجودة.'
    ),
    note: words(
      'File rotation is supported; scheduled cloud upload is part of the target workflow.',
      'تدوير الملفات مدعوم؛ الرفع السحابي المجدول جزء من التصميم المستهدف.',
      'تدوير الملفات موجود؛ الرفع للسحابة بجدول لسه ضمن التصميم المستهدف.'
    ),
  },
  {
    label: words(
      'Go straight to storage',
      'مباشرة إلى التخزين',
      'على التخزين مباشرة'
    ),
    title: words(
      'Let the files go straight through.',
      'دع الملفات تصل مباشرةً إلى التخزين.',
      'نخلّي الملفات توصل للتخزين مباشرة.'
    ),
    body: words(
      'Send files straight to object storage. This path removes the dedicated receiving server and primary database.',
      'أرسل الملفات مباشرة إلى التخزين الكائني. يستغني هذا المسار عن خادم الاستقبال وقاعدة البيانات الرئيسية.',
      'نبعت الملفات مباشرة للتخزين السحابي. المسار ده مش محتاج سيرفر استقبال ولا قاعدة بيانات أساسية.'
    ),
    note: words(
      'Storage, scoped upload credentials, retries and device power are still needed.',
      'تظل هناك حاجة إلى التخزين وصلاحيات رفع محدودة وإعادة المحاولة وطاقة الجهاز.',
      'لسه محتاجين تخزين وصلاحيات رفع محدودة وإعادة محاولة وطاقة للجهاز.'
    ),
  },
  {
    label: words(
      'Cloud-native analysis',
      'تحليل مصمّم للسحابة',
      'تحليل مصمّم للسحابة'
    ),
    title: words(
      'Open the files. See the pattern.',
      'افتح الملفات واكتشف ما تقوله القراءات.',
      'نفتح الملفات ونشوف القراءات بتقول إيه.'
    ),
    body: words(
      'Read the same files in a browser or analysis tool. Turn readings into charts.',
      'اقرأ الملفات نفسها في المتصفح أو أداة التحليل، وحوّل القراءات إلى رسوم بيانية.',
      'نقرأ نفس الملفات في المتصفح أو أداة التحليل، ونحوّل القراءات لرسوم بيانية.'
    ),
    note: words(
      'Analysis-ready format does not replace sensor calibration, quality checks or a trustworthy clock.',
      'الصيغة الجاهزة للتحليل لا تغني عن معايرة المستشعر وفحص الجودة والوقت الموثوق.',
      'صيغة جاهزة للتحليل مش بديل لمعايرة المستشعر وفحص الجودة ووقت موثوق.'
    ),
  },
  {
    label: words('Share with OpenAQ', 'المشاركة مع OpenAQ', 'نشارك مع OpenAQ'),
    title: words(
      'Share a copy with OpenAQ.',
      'شارك نسخة من البيانات مع OpenAQ.',
      'نشارك نسخة من البيانات مع OpenAQ.'
    ),
    body: words(
      'Export a JSON or CSV copy for OpenAQ to fetch. Keep the original Parquet files.',
      'صدّر نسخة JSON أو CSV ليجلبها OpenAQ، واحتفظ بملفات Parquet الأصلية.',
      'نصدّر نسخة JSON أو CSV عشان OpenAQ يسحبها، ونحتفظ بملفات Parquet الأصلية.'
    ),
    note: null,
  },
  {
    label: words(
      'A smaller operating footprint',
      'عبء تشغيل أقل',
      'تشغيل أبسط'
    ),
    title: words(
      'Same readings. A shorter journey.',
      'القراءات نفسها تصل بطريق أقصر.',
      'نفس القراءات توصل بطريق أقصر.'
    ),
    body: words(
      'Measure. Save. Read. Fewer services to keep running.',
      'قِس. احفظ. اقرأ. خدمات أقل تحتاج إلى تشغيل مستمر.',
      'نقيس. نحفظ. نقرأ. خدمات أقل تفضل شغّالة.'
    ),
    note: words(
      'Fewer components to operate is the design benefit. Energy, carbon and cost savings have not been measured.',
      'الفائدة التصميمية هي تقليل المكوّنات التي نُشغّلها. لم تُقَس وفورات الطاقة أو الكربون أو التكلفة.',
      'ميزة التصميم إن المكوّنات اللي بنشغّلها أقل. توفير الطاقة والكربون والتكلفة لسه متقاسش.'
    ),
  },
];
export const storyUi = {
  shortHint: words(
    'Use the arrows to follow the reading.',
    'استخدم السهمين لتتبّع القراءة.',
    'استخدم السهمين وتابع القراءة.'
  ),
  tryConnections: words(
    'Try a connection',
    'جرّب طريقة اتصال',
    'جرّب طريقة اتصال'
  ),
  closeConnections: words(
    'Back to the journey',
    'العودة إلى الرحلة',
    'نرجع للرحلة'
  ),
  scrollHintSmall: words(
    'Scroll to follow the reading',
    'مرّر لتتبع القراءة',
    'انزل وتابع القراءة'
  ),
  sectionLabel: words(
    'How sensor readings reach people',
    'كيف تصل قراءات المستشعر إلى الناس',
    'إزاي قراءات المستشعر بتوصل للناس'
  ),
  exampleData: words(
    'Illustrative readings',
    'قراءات توضيحية',
    'قراءات للتوضيح'
  ),
  fallback: words(
    'Sensor → Parquet → Object storage',
    'المستشعر ← Parquet ← التخزين الكائني',
    'المستشعر ← Parquet ← التخزين الكائني'
  ),
  previous: words('Previous moment', 'اللحظة السابقة'),
  next: words('Next moment', 'اللحظة التالية'),
  skip: words('Skip presentation', 'تجاوز العرض', 'عدّي العرض'),
  chapters: words('Follow the reading', 'تتبّع القراءة', 'تابع القراءة'),
  cadence: words('File interval', 'فترة الملف', 'مدة الملف'),
  quarter: words('15 minutes', '15 دقيقة'),
  hour: words('1 hour', 'ساعة واحدة'),
  files: words('files / device / day', 'ملفًا / جهاز / يوم'),
  estimate: words(
    'Illustrative, with uninterrupted recording. Same readings; different batch sizes.',
    'مثال بافتراض تسجيل متواصل. القراءات نفسها بأحجام دفعات مختلفة.',
    'مثال لو التسجيل متواصل. نفس القراءات في دفعات بأحجام مختلفة.'
  ),
  status: words(
    'Demonstrated capture → proposed cloud & OpenAQ path',
    'تسجيل مُثبت ← مسار سحابي وتكامل OpenAQ مقترح',
    'تسجيل اتجرّب ← مسار سحابي وتكامل OpenAQ مقترح'
  ),
  diagram: words(
    'Animated sensor data architecture',
    'رسم متحرك لبنية بيانات المستشعر'
  ),
  summary: words('The short version', 'باختصار', 'باختصار'),
  summaryBenefit: words(
    'No always-on receiving server.',
    'دون خادم استقبال يعمل باستمرار.',
    'من غير سيرفر استقبال شغّال طول الوقت.'
  ),
  min: words(
    'Upload cadence ≠ averaging period ≠ OpenAQ polling.',
    'وتيرة الرفع ≠ فترة المتوسط ≠ وتيرة جلب OpenAQ.',
    'مواعيد الرفع ≠ فترة المتوسط ≠ مواعيد سحب OpenAQ.'
  ),
  refresh: words('Reload diagram', 'إعادة تحميل الرسم', 'حمّل الرسم تاني'),
};
export const diagramWords = Object.fromEntries(
  [
    words('Air', 'الهواء', 'الهوا'),
    words('API / backend', 'واجهة API'),
    words('Sensor', 'المستشعر'),
    words('One reading', 'قراءة واحدة'),
    words('Always on', 'يعمل باستمرار', 'شغّال باستمرار'),
    words('Always-on server', 'خادم يعمل باستمرار', 'سيرفر شغّال باستمرار'),
    words('Receiving server', 'خادم الاستقبال', 'سيرفر الاستقبال'),
    words('Database', 'قاعدة بيانات'),
    words('Browser / app', 'المتصفح / التطبيق'),
    words('Common setup', 'المسار المعتاد', 'الطريقة المعتادة'),
    words('Removed', 'محذوف', 'اتشال'),
    words('Saved here first', 'تُحفظ هنا أولًا', 'تتحفظ هنا الأول'),
    words(
      'Readings become a file',
      'تجتمع القراءات في ملف',
      'القراءات تتجمع في ملف'
    ),
    words('Example readings', 'قراءات توضيحية', 'قراءات للتوضيح'),
    words('Illustrative readings', 'قراءات توضيحية', 'قراءات للتوضيح'),
    words('PM2.5', 'PM2.5'),
    words('Time (UTC)', 'الوقت (UTC)'),
    words('Temperature', 'درجة الحرارة'),
    words('Humidity', 'الرطوبة'),
    words('Shared storage', 'تخزين مشترك'),
    words('Every 15 min', 'كل 15 دقيقة'),
    words('Every hour', 'كل ساعة'),
    words('Object storage', 'التخزين الكائني'),
    words('Same files', 'الملفات نفسها', 'نفس الملفات'),
    words('Read directly', 'اقرأ مباشرةً'),
    words('Optional export', 'تصدير اختياري'),
    words('JSON / CSV', 'JSON / CSV'),
    words('Keep measuring', 'استمر في القياس', 'كمّل القياس'),
    words('Original files', 'الملفات الأصلية'),
    words('Read the files', 'اقرأ الملفات'),
    words('Public feed', 'تغذية بيانات عامة'),
    words('Optional', 'اختياري'),
    words('Proposed', 'مقترح'),
    words(
      'No dedicated ingest server',
      'بلا خادم استقبال مخصص',
      'من غير سيرفر استقبال مخصص'
    ),
    words(
      'Same readings. Fewer stops.',
      'القراءات نفسها. محطات أقل.',
      'نفس القراءات. محطات أقل.'
    ),
    words('.parquet', '.parquet'),
    words('Removed from this path', 'محذوف من هذا المسار'),
    words('Dedicated ingest', 'استقبال مخصص'),
    words('Primary database', 'قاعدة بيانات أساسية'),
    words('Minutes', 'دقائق'),
    words('SENSOR', 'المستشعر'),
    words('INGEST', 'الاستقبال'),
    words('DATABASE', 'قاعدة بيانات'),
    words('API', 'واجهة'),
    words('Always available', 'متاح باستمرار'),
    words('Readings', 'قراءات'),
    words('LOCAL PARQUET', 'PARQUET محلي'),
    words('Saved on device', 'محفوظ على الجهاز'),
    words('Connection optional', 'الاتصال اختياري'),
    words('Completed files', 'ملفات مكتملة'),
    words('OBJECT STORAGE', 'تخزين كائني'),
    words('Direct upload', 'رفع مباشر'),
    words('Optional relay', 'وسيط اختياري'),
    words('BROWSER', 'المتصفح'),
    words('NOTEBOOK', 'دفتر تحليل'),
    words('Read selected columns', 'قراءة أعمدة مختارة'),
    words('ON-DEMAND EXPORT', 'تصدير عند الحاجة'),
    words('PUBLIC FEED', 'تغذية عامة'),
    words('OpenAQ pulls', 'يسحب OpenAQ'),
    words('Proposed integration', 'تكامل مقترح'),
    words('Source of truth', 'مصدر الحقيقة'),
    words('Capture', 'تسجيل'),
    words('Store', 'تخزين'),
    words('Explore', 'استكشاف'),
    words('15 min / file', '15 دقيقة / ملف'),
    words('60 min / file', '60 دقيقة / ملف'),
  ].map((entry) => [entry.en, entry])
);

export const storySummary = [
  {
    title: words('Sensor', 'المستشعر', 'المستشعر'),
    hint: words('Measure', 'يقيس', 'يقيس'),
  },
  {
    title: words('Parquet files', 'ملفات Parquet'),
    hint: words('15 min / 1 hour', '15 دقيقة / ساعة'),
  },
  {
    title: words('Object storage', 'تخزين كائني', 'تخزين سحابي'),
    hint: words('Sync when ready', 'زامن عند الاتصال', 'ارفع وقت الاتصال'),
  },
  {
    title: words('Charts & tools', 'رسوم وأدوات', 'رسوم وأدوات'),
    hint: words('Read directly', 'اقرأ مباشرة', 'اقرأ مباشرة'),
  },
];

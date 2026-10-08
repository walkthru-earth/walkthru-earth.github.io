import type { Locale } from '@/lib/i18n/types';

const words = (en: string, ar: string, eg = ar): Record<Locale, string> => ({
  en,
  ar,
  'ar-EG': eg,
});

export const hardwareCopy = {
  title: words(
    'One core. Different sensors.',
    'نواة واحدة، مستشعرات مختلفة.',
    'نفس النواة، ومستشعرات مختلفة.'
  ),
  intro: words(
    'Choose what you want to measure.',
    'اختر ما تريد قياسه.',
    'اختار إيه اللي عايز تقيسه.'
  ),
  choose: words(
    'Choose a sensing module',
    'اختر وحدة استشعار',
    'اختار وحدة استشعار'
  ),
  prototype: words(
    'Tested prototypes',
    'نماذج أولية مُختبرة',
    'نماذج أولية اتجرّبت'
  ),
  roadmap: words('Planned module', 'وحدة مخطّط لها', 'وحدة في الخطة'),
  base: words('Base board', 'اللوحة الأساسية', 'اللوحة الأساسية'),
  core: words(
    'The same recording core',
    'نواة التسجيل نفسها',
    'نفس نواة التسجيل'
  ),
  builtIn: words('Built in', 'مدمج', 'مدمج'),
  time: words('Compatible RTC', 'ساعة RTC متوافقة', 'ساعة RTC متوافقة'),
  timeDetail: words(
    'Keep time across restarts.',
    'حفظ الوقت عند إعادة التشغيل.',
    'تحفظ الوقت بعد إعادة التشغيل.'
  ),
  timeNote: words(
    'RTC support depends on the board.',
    'دعم الساعة يعتمد على اللوحة.',
    'دعم الساعة حسب اللوحة.'
  ),
  storage: words('microSD', 'microSD'),
  storageDetail: words(
    'Readings saved as Parquet.',
    'القراءات محفوظة بصيغة Parquet.',
    'القراءات بتتحفظ بصيغة Parquet.'
  ),
  local: words(
    'Saved locally. No internet needed.',
    'محفوظ محليًا. لا حاجة إلى الإنترنت.',
    'محفوظ على الجهاز. من غير إنترنت.'
  ),
  external: words(
    'External radio modules · roadmap',
    'وحدات اتصال خارجية · ضمن الخطة',
    'وحدات اتصال خارجية · في الخطة'
  ),
  tested: words(
    'Tested prototypes: PMS5003T · PMSA003',
    'نماذج أولية مُختبرة: PMS5003T · PMSA003',
    'نماذج أولية اتجرّبت: PMS5003T · PMSA003'
  ),
  candidates: words(
    'Candidates: PMS5003 · SPS30 · SEN63C / SEN6x',
    'خيارات مرشّحة: PMS5003 · SPS30 · SEN63C / SEN6x',
    'خيارات مرشّحة: PMS5003 · SPS30 · SEN63C / SEN6x'
  ),
  prototypeNote: words(
    'PMS5003T supplies the five quantities shown. PMSA003 supplies particulate readings.',
    'يوفّر PMS5003T الكميات الخمس المعروضة، بينما يوفّر PMSA003 قراءات الجسيمات.',
    'PMS5003T بيوفّر الخمس قياسات المعروضة، وPMSA003 بيقيس الجسيمات.'
  ),
  compatibility: words(
    'Modules need matching power, interfaces and firmware.',
    'تحتاج الوحدات إلى طاقة وواجهات وبرمجيات ثابتة متوافقة.',
    'الوحدات محتاجة طاقة وتوصيلات وفيرموير متوافقين.'
  ),
  architecture: words(
    'Illustrated core architecture',
    'رسم توضيحي للبنية الأساسية',
    'رسم توضيحي للبنية الأساسية'
  ),
  airgap: words(
    'Air-gapped deployment · planned',
    'تشغيل معزول عن الشبكات · مخطّط',
    'تشغيل معزول عن الشبكات · في الخطة'
  ),
  airgapNote: words(
    'Offline recording works without internet. Current firmware still starts Bluetooth. A fully air-gapped deployment would disable radios and move files by microSD.',
    'يعمل التسجيل دون إنترنت، لكن البرمجيات الحالية تُشغّل Bluetooth. يتطلّب التشغيل المعزول تمامًا تعطيل الاتصالات اللاسلكية ونقل الملفات ببطاقة microSD.',
    'التسجيل بيشتغل من غير إنترنت، لكن الفيرموير الحالي لسه بيشغّل Bluetooth. التشغيل المعزول تمامًا محتاج تعطيل الاتصال اللاسلكي ونقل الملفات بكارت microSD.'
  ),
};

export const hardwareModules = [
  {
    id: 'air',
    label: words('Air', 'الهواء'),
    name: words('Air quality', 'جودة الهواء'),
    detail: words(
      'Particles, temperature and humidity.',
      'الجسيمات ودرجة الحرارة والرطوبة.',
      'جسيمات وحرارة ورطوبة.'
    ),
    interface: words('UART connection', 'اتصال UART', 'توصيل UART'),
    groups: [
      {
        label: words('Particles', 'الجسيمات'),
        value: 'PM1 · PM2.5 · PM10',
        unit: 'µg/m³',
      },
      { label: words('Temperature', 'درجة الحرارة'), value: '°C', unit: '' },
      { label: words('Humidity', 'الرطوبة'), value: '% RH', unit: '' },
    ],
  },
  {
    id: 'soil',
    label: words('Soil', 'التربة'),
    name: words('Soil nutrients', 'مغذّيات التربة', 'مغذّيات التربة'),
    detail: words(
      'An NPK module could extend the same recorder.',
      'يمكن لوحدة NPK أن توسّع قدرات المسجّل نفسه.',
      'وحدة NPK ممكن تزود قدرات نفس جهاز التسجيل.'
    ),
    interface: words(
      'Candidate: UART + RS485 adapter',
      'خيار مرشّح: UART مع محوّل RS485',
      'خيار مرشّح: UART مع محوّل RS485'
    ),
    groups: [
      { label: words('Nitrogen', 'النيتروجين'), value: 'N', unit: '' },
      { label: words('Phosphorus', 'الفوسفور'), value: 'P', unit: '' },
      { label: words('Potassium', 'البوتاسيوم'), value: 'K', unit: '' },
    ],
  },
  {
    id: 'gas',
    label: words('Gas', 'الغاز'),
    name: words('Hydrogen sensing', 'استشعار الهيدروجين'),
    detail: words(
      'A dedicated gas module, with its own calibration.',
      'وحدة غاز مخصّصة لها معايرتها الخاصة.',
      'وحدة غاز مخصصة بمعايرتها الخاصة.'
    ),
    interface: words(
      'Interface and power to validate',
      'الواجهة والطاقة قيد التحقّق',
      'التوصيل والطاقة محتاجين تحقق'
    ),
    groups: [{ label: words('Hydrogen', 'الهيدروجين'), value: 'H₂', unit: '' }],
  },
  {
    id: 'light',
    label: words('Light', 'الضوء'),
    name: words('Light sensing', 'استشعار الضوء'),
    detail: words(
      'Add a light module to record changing conditions.',
      'أضف وحدة ضوء لتسجيل تغيّر الظروف.',
      'وحدة ضوء تسجّل تغيّر الظروف.'
    ),
    interface: words(
      'Candidate interface: I²C / ADC',
      'واجهة مرشّحة: I²C / ADC'
    ),
    groups: [
      { label: words('Illuminance', 'شدة الإضاءة'), value: 'lux', unit: '' },
    ],
  },
  {
    id: 'sound',
    label: words('Sound', 'الصوت'),
    name: words('Audio sensing', 'استشعار الصوت'),
    detail: words(
      'A microphone module needs a matching audio pipeline.',
      'تحتاج وحدة الميكروفون إلى مسار معالجة صوت متوافق.',
      'وحدة الميكروفون محتاجة معالجة صوت متوافقة.'
    ),
    interface: words(
      'Candidate interface: I²S / ADC',
      'واجهة مرشّحة: I²S / ADC'
    ),
    groups: [{ label: words('Audio', 'الصوت'), value: 'MIC', unit: '' }],
  },
] as const;

export type HardwareModuleId = (typeof hardwareModules)[number]['id'];

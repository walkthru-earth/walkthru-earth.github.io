import type { MessageCatalog } from './types';

const phrase = (ar: string, arEG = ar) => ({ ar, arEG });

export const projectMessages: MessageCatalog = {
  'Follow the data': phrase('تتبّع البيانات', 'تابع رحلة البيانات'),
  'Loading street map…': phrase(
    'جارٍ تحميل خريطة الشوارع…',
    'بنحمّل خريطة الشوارع…'
  ),
  'Street map unavailable. Capture locations are still selectable.': phrase(
    'خريطة الشوارع غير متاحة. لا يزال بإمكانك اختيار مواقع التقاط الصور.',
    'خريطة الشوارع مش متاحة. لسه تقدر تختار أماكن التقاط الصور.'
  ),
  'Retry street map': phrase(
    'إعادة محاولة تحميل خريطة الشوارع',
    'جرّب تحميل خريطة الشوارع تاني'
  ),
  'CapyBrain research repository': phrase(
    'مستودع أبحاث CapyBrain',
    'مستودع أبحاث CapyBrain'
  ),
  'Meet your capybara guide': phrase(
    'تعرّف على دليلك من الكابيبارا',
    'اتعرّف على دليلك الكابيبارا'
  ),
  'CapyBrain’s friendly tan capybara mascot': phrase(
    'شخصية كابيبارا ودودة بلون بني فاتح، تميمة CapyBrain',
    'كابيبارا ودود بلون بني فاتح، شخصية CapyBrain'
  ),
  'CapyBrain capybara mascot': phrase(
    'شخصية الكابيبارا، تميمة CapyBrain',
    'شخصية الكابيبارا بتاعة CapyBrain'
  ),
  Places: phrase('الأماكن'),
  Patterns: phrase('الأنماط'),
  'Notice the places we move through every day.': phrase(
    'لاحظ الأماكن التي نمرّ بها كل يوم.',
    'لاحظ الأماكن اللي بنعدّي عليها كل يوم.'
  ),
  'Make room for people’s experiences, not just measurements.': phrase(
    'أفسح المجال لتجارب الناس، ولا تكتفِ بالقياسات.',
    'خلّي فيه مساحة لتجارب الناس، مش بس للقياسات.'
  ),
  'Explore evidence with curiosity, and keep its limits in view.': phrase(
    'استكشف الأدلة بفضول، مع إدراك حدودها.',
    'استكشف الأدلة بفضول، وخليك واعي بحدودها.'
  ),
  'Meet our peacock guide': phrase(
    'تعرّف على الطاووس، دليلنا',
    'اتعرّف على الطاووس، دليلنا'
  ),
  'OpenSensor’s blue and teal peacock mascot': phrase(
    'طاووس باللونين الأزرق والأخضر المزرق، تميمة OpenSensor',
    'طاووس أزرق وأخضر مزرق، شخصية OpenSensor'
  ),
  Sense: phrase('ارصد'),
  Save: phrase('احفظ'),
  Sync: phrase('زامن'),
  'Observe the air and weather, wherever you are.': phrase(
    'ارصد الهواء والطقس، أينما كنت.',
    'ارصد الهوا والطقس، في أي مكان تكون فيه.'
  ),
  'Keep measurements on the device when connections disappear.': phrase(
    'احتفظ بالقياسات على الجهاز عند انقطاع الاتصال.',
    'احتفظ بالقياسات على الجهاز لما الاتصال يفصل.'
  ),
  'Share directly with object storage, or through a nearby phone or hub.':
    phrase(
      'شارك البيانات مباشرة مع التخزين الكائني، أو عبر هاتف قريب أو جهاز تجميع.',
      'شارك البيانات مباشرة مع التخزين الكائني، أو عن طريق موبايل قريب أو جهاز تجميع.'
    ),
  'Replay character animation': phrase(
    'إعادة تشغيل حركة الشخصية',
    'شغّل حركة الشخصية تاني'
  ),
  'Explore with our guide': phrase('استكشف مع دليلنا', 'استكشف مع دليلنا'),
  'Built for places beyond the network.': phrase(
    'مصمّم للأماكن خارج نطاق الشبكة.',
    'مصمّم للأماكن اللي برّه تغطية الشبكة.'
  ),
  'Our peacock guide connects local observations with a shared picture of the environment. Keep collecting locally, then sync directly or through a nearby device when a connection is available.':
    phrase(
      'يربط دليلنا الطاووس بين الرصد المحلي وصورة مشتركة للبيئة. واصل جمع البيانات محليًا، ثم زامنها مباشرة أو عبر جهاز قريب عندما يتوفر اتصال.',
      'الطاووس دليلنا بيربط الرصد المحلي بصورة مشتركة للبيئة. كمّل جمع البيانات محليًا، وبعدين زامنها مباشرة أو عن طريق جهاز قريب لما الاتصال يتوفر.'
    ),
  'See how sync works': phrase(
    'تعرّف على آلية المزامنة',
    'شوف المزامنة بتشتغل إزاي'
  ),
  'A curious guide to people and places.': phrase(
    'دليل فضولي لفهم الناس والأماكن.',
    'دليل فضولي علشان نفهم الناس والأماكن.'
  ),
  'Inside the prototype': phrase('داخل النموذج الأولي', 'جوّه النموذج الأولي'),
  'Interface concepts for exploring places and sharing experiences.': phrase(
    'تصورات لواجهات تتيح استكشاف الأماكن ومشاركة التجارب.',
    'أفكار لواجهات تساعدنا نستكشف الأماكن ونشارك تجاربنا.'
  ),
  'View full screenshot': phrase(
    'عرض لقطة الشاشة كاملة',
    'شوف لقطة الشاشة كاملة'
  ),
  'View full screenshot (opens in a new tab)': phrase(
    'عرض لقطة الشاشة كاملة (تفتح في علامة تبويب جديدة)',
    'شوف لقطة الشاشة كاملة (بتفتح في تبويب جديد)'
  ),
  'Keep measuring, even when the connection drops.': phrase(
    'واصل القياس، حتى عند انقطاع الاتصال.',
    'كمّل القياس، حتى لو الاتصال فصل.'
  ),
  'Save readings as Parquet on the edge device. Sync directly to object storage or through a nearby phone or local hub. Explore the files from your browser or app.':
    phrase(
      'احفظ القراءات بصيغة Parquet على الجهاز الطرفي. زامنها مباشرة مع التخزين الكائني أو عبر هاتف قريب أو جهاز تجميع محلي. استكشف الملفات من متصفحك أو تطبيقك.',
      'احفظ القراءات بصيغة Parquet على الجهاز الطرفي. زامنها مباشرة مع التخزين الكائني أو عن طريق موبايل قريب أو جهاز تجميع محلي. استكشف الملفات من متصفحك أو تطبيقك.'
    ),
  'Keep measuring. Sync when ready.': phrase(
    'واصل القياس. زامن عندما تكون جاهزًا.',
    'كمّل القياس. زامن لما تكون جاهز.'
  ),
  'Try a connection scenario': phrase('جرّب سيناريو اتصال', 'جرّب حالة اتصال'),
  Offline: phrase('دون اتصال', 'من غير اتصال'),
  'Phone / hub': phrase('هاتف / جهاز تجميع', 'موبايل / جهاز تجميع'),
  Internet: phrase('الإنترنت'),
  'Connection lost. Measurements kept.': phrase(
    'انقطع الاتصال. القياسات محفوظة.',
    'الاتصال فصل. القياسات محفوظة.'
  ),
  'The edge device keeps recording to local Parquet files. Transfers wait for a connection; collection carries on.':
    phrase(
      'يواصل الجهاز الطرفي التسجيل في ملفات Parquet محلية. ينتظر نقل البيانات توفر اتصال، بينما يستمر جمعها.',
      'الجهاز الطرفي بيكمّل التسجيل في ملفات Parquet محلية. نقل البيانات بيستنى الاتصال يرجع، وجمعها بيكمّل.'
    ),
  'A nearby connection is enough.': phrase(
    'يكفي اتصال قريب.',
    'اتصال قريب يكفي.'
  ),
  'Sync over Bluetooth to a phone, or over the local network to a hub. Read and analyse files locally, without an internet connection.':
    phrase(
      'زامن عبر Bluetooth مع هاتف، أو عبر الشبكة المحلية مع جهاز تجميع. اقرأ الملفات وحلّلها محليًا، دون اتصال بالإنترنت.',
      'زامن عن طريق Bluetooth مع موبايل، أو على الشبكة المحلية مع جهاز تجميع. اقرأ الملفات وحلّلها محليًا، من غير اتصال بالإنترنت.'
    ),
  'Stored locally. Shared when connected.': phrase(
    'تُحفظ محليًا. وتُشارك عند الاتصال.',
    'محفوظة محليًا. بتتشارك لما الاتصال يتوفر.'
  ),
  'Upload directly, or relay through a phone or hub. Partitioned Parquet in object storage is ready for public, direct reads by browsers and apps.':
    phrase(
      'ارفع الملفات مباشرة، أو مرّرها عبر هاتف أو جهاز تجميع. تتيح ملفات Parquet المقسّمة في التخزين الكائني القراءة العامة المباشرة من المتصفحات والتطبيقات.',
      'ارفع الملفات مباشرة، أو ابعتها عن طريق موبايل أو جهاز تجميع. ملفات Parquet المتقسّمة في التخزين الكائني متاحة للكل يقراها مباشرة من المتصفحات والتطبيقات.'
    ),
  'Edge device': phrase('جهاز طرفي'),
  'Sensor → local Parquet': phrase(
    'من المستشعر إلى Parquet محلي',
    'من الحساس لـ Parquet محلي'
  ),
  'Saved on device': phrase('محفوظ على الجهاز'),
  'Phone or local hub': phrase(
    'هاتف أو جهاز تجميع محلي',
    'موبايل أو جهاز تجميع محلي'
  ),
  'Bluetooth · local network': phrase('Bluetooth · شبكة محلية'),
  'Sync available': phrase('المزامنة متاحة'),
  'Waiting to sync': phrase('بانتظار المزامنة', 'في انتظار المزامنة'),
  'Works without internet': phrase('يعمل دون إنترنت', 'بيشتغل من غير إنترنت'),
  'Browser / app': phrase('متصفح / تطبيق'),
  'Read shared files directly': phrase('اقرأ الملفات المشتركة مباشرة'),
  'Analyse local files': phrase('حلّل الملفات المحلية'),
  'Object storage': phrase('التخزين الكائني'),
  'Partitioned Parquet': phrase('ملفات Parquet مقسّمة'),
  'Public · no sign-in': phrase(
    'عام · دون تسجيل دخول',
    'متاح للكل · من غير تسجيل دخول'
  ),
  'Internet optional': phrase('الإنترنت اختياري'),
  'Optional relay': phrase('وسيط اختياري'),
  'Direct upload': phrase('رفع مباشر'),
  'Local sync': phrase('مزامنة محلية'),
  'Direct reads, fewer services': phrase('قراءة مباشرة، خدمات أقل'),
  'Choose a connection · Illustrated architecture': phrase(
    'اختر اتصالًا · مخطط توضيحي للبنية التقنية',
    'اختار اتصال · رسم بيوضّح البنية التقنية'
  ),
  'Local first. Open by design.': phrase(
    'محلي أولًا. مفتوح بحكم التصميم.',
    'محلي الأول. مفتوح من البداية.'
  ),
  'From an isolated field station to public analysis, the same files travel with the data.':
    phrase(
      'من محطة ميدانية معزولة إلى تحليل متاح للجميع، تنتقل البيانات في الملفات نفسها.',
      'من محطة ميدانية معزولة لتحليل متاح للكل، البيانات بتتنقل في نفس الملفات.'
    ),
  'Record on the edge': phrase('سجّل على الجهاز الطرفي'),
  'Store measurements as local Parquet files before transferring them. A Wi-Fi outage pauses sync, while the sensor keeps collecting on the device.':
    phrase(
      'احفظ القياسات في ملفات Parquet محلية قبل نقلها. يوقف انقطاع Wi-Fi المزامنة مؤقتًا، بينما يواصل المستشعر جمع البيانات على الجهاز.',
      'احفظ القياسات في ملفات Parquet محلية قبل ما تنقلها. لو Wi-Fi فصل، المزامنة بتقف مؤقتًا، والحساس بيكمّل جمع البيانات على الجهاز.'
    ),
  'Sync with what is nearby': phrase(
    'زامن مع الأجهزة القريبة',
    'زامن مع الأجهزة اللي حواليك'
  ),
  'Use Bluetooth to a mobile phone in the field, or a local network to a hub or server. Isolated deployments can keep storage and analysis local; internet sync is optional.':
    phrase(
      'اتصل عبر Bluetooth بهاتف محمول في الميدان، أو عبر شبكة محلية بجهاز تجميع أو خادم. يمكن للمحطات المعزولة إبقاء التخزين والتحليل محليين؛ والمزامنة عبر الإنترنت اختيارية.',
      'اتصل عن طريق Bluetooth بموبايل في الميدان، أو على شبكة محلية بجهاز تجميع أو خادم. المحطات المعزولة تقدر تخلي التخزين والتحليل محليين؛ والمزامنة على الإنترنت اختيارية.'
    ),
  'Share open files': phrase('شارك ملفات مفتوحة'),
  'When internet is available, sync directly or through a relay to object storage. Publish partitioned Parquet for anonymous reads, with no sign-in required.':
    phrase(
      'عند توفر الإنترنت، زامن مع التخزين الكائني مباشرة أو عبر جهاز وسيط. انشر ملفات Parquet مقسّمة للقراءة دون تقديم هوية أو تسجيل دخول.',
      'لما الإنترنت يكون متاح، زامن مع التخزين الكائني مباشرة أو عن طريق جهاز وسيط. انشر ملفات Parquet متقسّمة علشان أي حد يقراها من غير ما يقدّم هويته أو يسجّل دخول.'
    ),
  'Analyse where you are': phrase('حلّل أينما كنت', 'حلّل من مكانك'),
  'Browsers, apps and analytical tools read the files directly. Use Apache Parquet, Apache Iceberg tables and STAC discovery with compatible clients, reducing reliance on always-on servers.':
    phrase(
      'تقرأ المتصفحات والتطبيقات وأدوات التحليل الملفات مباشرة. استخدم Apache Parquet وجداول Apache Iceberg واستكشاف البيانات عبر STAC مع البرامج المتوافقة، لتقليل الاعتماد على خوادم تعمل باستمرار.',
      'المتصفحات والتطبيقات وأدوات التحليل بتقرأ الملفات مباشرة. استخدم Apache Parquet وجداول Apache Iceberg واستكشاف البيانات عن طريق STAC مع البرامج المتوافقة، علشان تقلّل الاعتماد على خوادم شغّالة طول الوقت.'
    ),
  Files: phrase('ملفات'),
  Tables: phrase('جداول'),
  Discovery: phrase('استكشاف البيانات'),
  'Supported devices': phrase('الأجهزة المدعومة'),
  'Connect your station.': phrase('وصّل محطتك.'),
  'Share readings from your own environmental sensor.': phrase(
    'شارك قراءات مستشعرك البيئي.',
    'شارك قراءات مستشعرك البيئي.'
  ),
  'A research prototype exploring how environmental conditions relate to residents’ experiences.':
    phrase(
      'نموذج بحثي أولي يستكشف العلاقة بين الظروف البيئية وتجارب السكان.',
      'نموذج بحثي أولي بيستكشف العلاقة بين الظروف البيئية وتجارب السكان.'
    ),
  'Explore the experiment': phrase('استكشف التجربة', 'جرّب الاستكشاف'),
  'Research approach': phrase('النهج البحثي', 'طريقة البحث'),
  'Explore the data': phrase('استكشف البيانات'),
  'We aim to connect environmental readings with residents’ feedback. Survey consent, privacy, sampling, and validation are still being developed.':
    phrase(
      'نسعى إلى ربط القراءات البيئية بآراء السكان. وما زلنا نطوّر ضوابط الموافقة والخصوصية واختيار العينات والتحقق من نتائج الاستبيانات.',
      'هدفنا نربط القراءات البيئية بآراء السكان. ولسه بنطوّر ضوابط الموافقة والخصوصية واختيار العينات والتحقق من نتائج الاستبيانات.'
    ),
  'Possible topics, not validated neighborhood scores.': phrase(
    'موضوعات محتملة للبحث، وليست تقييمات معتمدة للأحياء.',
    'موضوعات ممكن ندرسها، مش تقييمات معتمدة للأحياء.'
  ),
  'Street images around Borough Market, London, processed with Meta’s': phrase(
    'صور شوارع حول سوق بورو في لندن، عولجت باستخدام نموذج ميتا',
    'صور شوارع حوالين سوق بورو في لندن، اتعالجت باستخدام نموذج ميتا'
  ),
  'model to visualize predicted brain activity.': phrase(
    'لعرض نشاط الدماغ المتوقع.',
    'لعرض نشاط المخ المتوقع.'
  ),
  'Select a marker to explore a prediction. This model does not measure anyone’s brain activity, hormones, emotions, or health, or establish how a place makes people feel.':
    phrase(
      'اختر علامة لاستكشاف التنبؤ. لا يقيس هذا النموذج نشاط الدماغ أو الهرمونات أو المشاعر أو صحة أي شخص، ولا يثبت كيف يؤثر المكان في شعور الناس.',
      'اختار علامة عشان تستكشف التنبؤ. النموذج ده ما بيقيسش نشاط المخ أو الهرمونات أو المشاعر أو صحة أي شخص، وما بيثبتش المكان بيخلّي الناس تحس بإيه.'
    ),
  'Source code:': phrase('الشفرة المصدرية:', 'الكود المصدري:'),
  'Methods and licenses': phrase('المنهجية والتراخيص', 'الطريقة والتراخيص'),
  'Explore environmental context on our live globe.': phrase(
    'استكشف الظروف البيئية على الكرة الأرضية التفاعلية.',
    'استكشف الظروف البيئية على الكرة الأرضية التفاعلية.'
  ),
  'Loading experiment…': phrase('جارٍ تحميل التجربة…', 'بنحمّل التجربة…'),
  'Know Your Local Environment': phrase(
    'تعرّف على بيئتك المحلية',
    'اعرف بيئتك المحلية'
  ),
  'Open tools for collecting and sharing air quality and weather readings. A starting point for investigating local conditions, environmental exposure, and questions about healthier places to live.':
    phrase(
      'أدوات مفتوحة لجمع قراءات جودة الهواء والطقس ومشاركتها. نقطة بداية لدراسة الظروف المحلية والتعرّض البيئي والأسئلة المتعلقة بأماكن أكثر صحة للعيش.',
      'أدوات مفتوحة لجمع قراءات جودة الهوا والطقس ومشاركتها. نقطة بداية لدراسة الظروف المحلية والتعرّض البيئي والأسئلة عن أماكن أصح للعيش.'
    ),
  'Explore Live Dashboard': phrase(
    'استكشف لوحة البيانات المباشرة',
    'شوف لوحة البيانات المباشرة'
  ),
  'Dashboard Code': phrase('شفرة لوحة البيانات', 'كود لوحة البيانات'),
  'Edge Code': phrase('شفرة الأجهزة الطرفية', 'كود الأجهزة الطرفية'),
  'Data Points': phrase('نقاط بيانات'),
  'Sensor Types': phrase('أنواع المستشعرات'),
  Open: phrase('مفتوح'),
  'Source & Data': phrase('المصدر والبيانات'),
  Platform: phrase('المنصة'),
  Benefits: phrase('المزايا'),
  'Tools to collect, inspect, and share local environmental evidence': phrase(
    'أدوات لجمع الأدلة البيئية المحلية وفحصها ومشاركتها',
    'أدوات تجمع وتفحص وتشارك الأدلة البيئية المحلية'
  ),
  'Lean Infrastructure': phrase('بنية تحتية خفيفة'),
  'Object storage and browser analysis reduce the need to maintain a separate database server':
    phrase(
      'يقلّل التخزين الكائني والتحليل في المتصفح الحاجة إلى صيانة خادم منفصل لقواعد البيانات',
      'التخزين الكائني والتحليل في المتصفح بيقلّلوا الحاجة لصيانة خادم قاعدة بيانات منفصل'
    ),
  'Local Monitoring': phrase('رصد محلي', 'مراقبة محلية'),
  'Collect readings from your own station and share them through the network':
    phrase(
      'اجمع قراءات من محطتك وشاركها عبر الشبكة',
      'اجمع قراءات من محطتك وشاركها على الشبكة'
    ),
  'Open Source & Transparent': phrase('مفتوح المصدر وشفاف'),
  'Full visibility into code, data formats, and infrastructure': phrase(
    'رؤية كاملة للشفرة وصيغ البيانات والبنية التحتية',
    'تقدر تشوف الكود وصيغ البيانات والبنية التحتية بالكامل'
  ),
  'Hardware agnostic': phrase(
    'غير مقيّد بأجهزة محددة',
    'بيشتغل مع أجهزة مختلفة'
  ),
  'Python-based edge software, with implemented sensors and planned integrations listed below':
    phrase(
      'برمجيات طرفية مبنية بلغة Python، مع المستشعرات المنفّذة والتكاملات المخططة المدرجة أدناه',
      'برمجيات طرفية مبنية بـ Python، والمستشعرات المنفّذة والتكاملات المخطط لها موجودة تحت'
    ),
  'Standard Data Formats': phrase('صيغ بيانات قياسية'),
  'Parquet files for reuse in compatible analytics tools': phrase(
    'ملفات Parquet لإعادة استخدامها في أدوات التحليل المتوافقة',
    'ملفات Parquet تقدر تستخدمها تاني في أدوات التحليل المتوافقة'
  ),
  'Near Real-Time Processing': phrase('معالجة شبه لحظية'),
  'Query millions of records directly in the browser': phrase(
    'استعلم عن ملايين السجلات مباشرة في المتصفح',
    'استعلم عن ملايين السجلات من المتصفح على طول'
  ),
  Supported: phrase('المدعومة'),
  Sensors: phrase('المستشعرات'),
  'Environmental measurements and potential integrations; implemented devices are listed below':
    phrase(
      'قياسات بيئية وتكاملات محتملة؛ الأجهزة المنفّذة مدرجة أدناه',
      'قياسات بيئية وتكاملات ممكنة؛ الأجهزة المنفّذة موجودة تحت'
    ),
  Pressure: phrase('الضغط'),
  Humidity: phrase('الرطوبة'),
  'Gas Sensors': phrase('مستشعرات الغازات'),
  'Light (Lux)': phrase('الضوء (لوكس)'),
  Motion: phrase('الحركة'),
  'Particulate Matter': phrase('الجسيمات العالقة'),
  'Custom Sensors': phrase('مستشعرات مخصصة'),
  'Ambient & industrial sensors': phrase('مستشعرات محيطة وصناعية'),
  'Atmospheric & process': phrase('قياسات جوية وعمليات صناعية'),
  'Air quality & emissions': phrase(
    'جودة الهواء والانبعاثات',
    'جودة الهوا والانبعاثات'
  ),
  'Solar & ambient light': phrase('الإضاءة الشمسية والمحيطة'),
  'Presence & activity': phrase('الوجود والنشاط'),
  'Any data stream': phrase('أي تدفق بيانات'),
  'Cloud-Native': phrase('سحابية أصلًا', 'مصممة للسحابة'),
  Architecture: phrase('البنية التقنية'),
  'Serverless infrastructure designed for efficiency and scale': phrase(
    'بنية تحتية بلا خوادم مصممة للكفاءة والتوسع',
    'بنية من غير خوادم مصممة للكفاءة والتوسع'
  ),
  'IoT devices collect sensor data at configurable intervals. Works autonomously, even offline with local buffering.':
    phrase(
      'تجمع أجهزة إنترنت الأشياء بيانات المستشعرات على فترات قابلة للضبط، وتعمل ذاتيًا حتى دون اتصال مع تخزين مؤقت محلي.',
      'أجهزة إنترنت الأشياء بتجمع بيانات المستشعرات على فترات تقدر تضبطها، وبتشتغل لوحدها حتى من غير إنترنت مع تخزين مؤقت محلي.'
    ),
  'Cloud Storage': phrase('التخزين السحابي'),
  'Data streams directly to S3-compatible object storage in Parquet format. No intermediate database required.':
    phrase(
      'تتدفق البيانات مباشرة إلى تخزين كائني متوافق مع S3 بصيغة Parquet، دون الحاجة إلى قاعدة بيانات وسيطة.',
      'البيانات بتروح مباشرة لتخزين كائني متوافق مع S3 بصيغة Parquet، من غير قاعدة بيانات في النص.'
    ),
  'Query data directly in browser using DuckDB WebAssembly. Dashboards update automatically.':
    phrase(
      'استعلم عن البيانات مباشرة في المتصفح باستخدام DuckDB WebAssembly. تتحدّث لوحات البيانات تلقائيًا.',
      'استعلم عن البيانات من المتصفح مباشرة باستخدام DuckDB WebAssembly. ولوحات البيانات بتتحدّث لوحدها.'
    ),
  'Technical Advantages': phrase('المزايا التقنية'),
  'How the monitoring system is organized': phrase(
    'كيفية تنظيم نظام الرصد',
    'نظام المراقبة متظبط إزاي'
  ),
  'Python edge software for sensor collection': phrase(
    'برمجيات Python طرفية لجمع بيانات المستشعرات'
  ),
  'Object storage without a separate database server': phrase(
    'تخزين كائني دون خادم منفصل لقواعد البيانات'
  ),
  'Configurable collection intervals and station registration': phrase(
    'فترات جمع قابلة للضبط وتسجيل للمحطات'
  ),
  'Standard data formats for compatible analytics tools': phrase(
    'صيغ بيانات قياسية لأدوات التحليل المتوافقة'
  ),
  'Resilient - offline operation with automatic sync': phrase(
    'مرن — يعمل دون اتصال مع مزامنة تلقائية',
    'مرن — بيشتغل من غير إنترنت وبيزامن تلقائي'
  ),
  'Transparent - open source code and public data': phrase(
    'شفاف — شفرة مفتوحة المصدر وبيانات عامة',
    'شفاف — الكود مفتوح والبيانات عامة'
  ),
  Devices: phrase('الأجهزة'),
  'Current integrations and the development roadmap': phrase(
    'التكاملات الحالية وخارطة طريق التطوير',
    'التكاملات الحالية وخطة التطوير'
  ),
  Implemented: phrase('منفّذ', 'شغّال'),
  Roadmap: phrase('على خارطة الطريق', 'في الخطة'),
  'Temperature, pressure, and humidity sensor': phrase(
    'مستشعر للحرارة والضغط والرطوبة'
  ),
  'Oxidised, reducing, and NH3 gas detection': phrase(
    'كشف الغازات المؤكسدة والمختزلة وغاز NH3'
  ),
  'Ambient light (lux) and proximity sensor': phrase(
    'مستشعر للإضاءة المحيطة (لوكس) والقرب'
  ),
  'Particulate matter sensor (PM1, PM2.5, PM10)': phrase(
    'مستشعر للجسيمات العالقة (PM1 وPM2.5 وPM10)'
  ),
  'GPS Module': phrase('وحدة GPS'),
  'Location tracking for mobile sensor installations': phrase(
    'تحديد الموقع لتركيبات المستشعرات المتنقلة'
  ),
  'Long-range wireless and radio signal reception': phrase(
    'استقبال لاسلكي بعيد المدى وإشارات الراديو'
  ),
  'Powered by': phrase('مدعوم من', 'مبني باستخدام'),
  'Connect Your': phrase('اربط'),
  'Sensors to the Cloud': phrase('مستشعراتك بالسحابة'),
  'Start collecting sensor data with our open-source platform. Contribute to the growing network of environmental monitoring stations worldwide.':
    phrase(
      'ابدأ جمع بيانات المستشعرات باستخدام منصتنا مفتوحة المصدر. وساهم في الشبكة المتنامية لمحطات الرصد البيئي حول العالم.',
      'ابدأ اجمع بيانات المستشعرات بمنصتنا مفتوحة المصدر، وساهم في شبكة محطات المراقبة البيئية اللي بتكبر حوالين العالم.'
    ),
  'Join the Network': phrase('انضم إلى الشبكة', 'انضم للشبكة'),
  'Explore Dashboard': phrase('استكشف لوحة البيانات', 'شوف لوحة البيانات'),
  'Getting Started': phrase('البدء', 'ابدأ من هنا'),
  'Deploy Edge Software': phrase(
    'ثبّت البرمجيات الطرفية',
    'نزّل برنامج الجهاز الطرفي'
  ),
  'Install the edge client on your IoT device': phrase(
    'ثبّت العميل الطرفي على جهاز إنترنت الأشياء',
    'ثبّت البرنامج الطرفي على جهاز إنترنت الأشياء'
  ),
  'Configure Storage': phrase('اضبط التخزين'),
  'Use Source Cooperative or your own S3-compatible storage': phrase(
    'استخدم Source Cooperative أو تخزينك المتوافق مع S3',
    'استخدم Source Cooperative أو التخزين المتوافق مع S3 بتاعك'
  ),
  'Register Your Station': phrase('سجّل محطتك'),
  'Submit a PR with your station ID and location': phrase(
    'أرسل طلب دمج يتضمن معرّف محطتك وموقعها',
    'ابعث PR فيه معرّف محطتك ومكانها'
  ),
  'Start Streaming': phrase('ابدأ إرسال البيانات'),
  'Your data appears on the public dashboard automatically': phrase(
    'تظهر بياناتك تلقائيًا في لوحة البيانات العامة',
    'بياناتك هتظهر تلقائي على لوحة البيانات العامة'
  ),

  'How do the places we live relate to how we feel? We are exploring this question through environmental data, planned resident surveys, and an experimental street imagery model. The app screens are prototypes.':
    phrase(
      'ما علاقة الأماكن التي نعيش فيها بما نشعر به؟ نستكشف هذا السؤال من خلال البيانات البيئية، واستبيانات مخططة للسكان، ونموذج تجريبي لصور الشوارع. شاشات التطبيق نماذج أولية.',
      'الأماكن اللي بنعيش فيها ليها علاقة بإحساسنا إزاي؟ بنستكشف السؤال ده من خلال بيانات بيئية واستبيانات مخطط لها للسكان ونموذج تجريبي لصور الشوارع. شاشات التطبيق مجرد نماذج أولية.'
    ),
  'Urban wellbeing': phrase('جودة الحياة الحضرية', 'جودة الحياة في المدن'),
  'Planned surveys': phrase('استبيانات مخططة', 'استبيانات مخطط لها'),
  'Environmental data': phrase('بيانات بيئية'),
  'Research prototype': phrase('نموذج بحثي أولي'),
  'Explore live data': phrase(
    'استكشف البيانات المباشرة',
    'شوف البيانات المباشرة'
  ),
  'Understand the place,': phrase('افهم المكان،'),
  'listen to the people': phrase('واستمع إلى الناس', 'واسمع الناس'),
  'Environmental measurements describe conditions around us. Residents can describe experiences those measurements miss. We want to investigate how these perspectives relate, without treating a map or a model as a substitute for what people say.':
    phrase(
      'تصف القياسات البيئية الظروف المحيطة بنا، بينما يستطيع السكان وصف تجارب لا تلتقطها تلك القياسات. نريد دراسة العلاقة بين هذه المنظورات، دون اعتبار الخريطة أو النموذج بديلًا عما يقوله الناس.',
      'القياسات البيئية بتوصف الظروف حوالينا، والسكان يقدروا يوصفوا تجارب القياسات دي ما بتلقطهاش. عايزين ندرس العلاقة بين المنظورين من غير ما نعتبر الخريطة أو النموذج بديل لكلام الناس.'
    ),
  'Our research question:': phrase('سؤالنا البحثي:', 'سؤال البحث بتاعنا:'),
  "How can environmental evidence and residents' experiences inform healthier neighborhoods?":
    phrase(
      'كيف يمكن للأدلة البيئية وتجارب السكان أن تسهم في أحياء أكثر صحة؟',
      'إزاي الأدلة البيئية وتجارب السكان ممكن تساعد في بناء أحياء أصح؟'
    ),
  'The survey approach and safeguards are still being developed.': phrase(
    'لا يزال نهج الاستبيان وضمانات الحماية قيد التطوير.',
    'طريقة الاستبيان وضمانات الحماية لسه قيد التطوير.'
  ),
  'Live experiment': phrase('تجربة مباشرة', 'تجربة شغّالة'),
  'From a London street': phrase('من شارع في لندن'),
  'to predicted brain activity': phrase(
    'إلى نشاط دماغي متوقّع',
    'لتوقّعات نشاط الدماغ'
  ),
  "A small proof-of-concept from our CapyBrain work, Mapillary street imagery around Borough Market, run through Meta's":
    phrase(
      'إثبات مفهوم صغير من عملنا في CapyBrain: صور شوارع من Mapillary حول Borough Market، مرّت عبر',
      'تجربة مبدئية صغيرة من شغلنا في CapyBrain: صور شوارع من Mapillary حوالين Borough Market، عدّت على'
    ),
  "vision-only brain encoder, mapped onto the fsaverage5 cortical surface. Tap a marker to explore the model's prediction for that image. This experiment does not measure residents' brain activity, hormones, emotions, or health.":
    phrase(
      'وهو مُرمِّز دماغي يعتمد على الرؤية فقط، مع إسقاط النتائج على السطح القشري fsaverage5. اضغط على علامة لاستكشاف تنبؤ النموذج لتلك الصورة. لا تقيس هذه التجربة نشاط أدمغة السكان أو هرموناتهم أو مشاعرهم أو صحتهم.',
      'وده مُرمِّز للدماغ بيعتمد على الرؤية بس، والنتائج متسقطة على سطح القشرة fsaverage5. اضغط على علامة علشان تستكشف توقّع النموذج للصورة. التجربة دي ما بتقيسش نشاط مخ السكان ولا هرموناتهم ولا مشاعرهم ولا صحتهم.'
    ),
  'Static street images are a limited input. These predictions have not established how a street makes someone feel or whether it improves wellbeing. Source code:':
    phrase(
      'صور الشوارع الثابتة مدخل محدود. لم تثبت هذه التنبؤات كيف يجعل الشارع شخصًا يشعر أو ما إذا كان يحسّن جودة الحياة. الشفرة المصدرية:',
      'صور الشوارع الثابتة مدخل محدود. التوقّعات دي ما أثبتتش الشارع بيخلّي حد يحس بإيه ولا إذا كان بيحسّن جودة الحياة. الكود المصدري:'
    ),
  '. Encoder weights and reference code from': phrase(
    '. أوزان المُرمِّز والشفرة المرجعية من',
    '. أوزان المُرمِّز والكود المرجعي من'
  ),
  ', licensed': phrase('، بترخيص'),
  '(non-commercial).': phrase('(للاستخدام غير التجاري).'),
  'Street imagery from': phrase('صور الشوارع من'),
  'contributors, CC-BY-SA. Cortical parcels from the HCP MMP1 atlas (Glasser et al., 2016).':
    phrase(
      'ومساهميه، بترخيص CC-BY-SA. ومناطق القشرة من أطلس HCP MMP1 ‏(Glasser وآخرون، 2016).',
      'والمساهمين فيه، بترخيص CC-BY-SA. ومناطق القشرة من أطلس HCP MMP1 ‏(Glasser وآخرون، 2016).'
    ),
  'Our code and derived data are licensed': phrase(
    'شفرتنا والبيانات المشتقة مرخصة بموجب',
    'الكود والبيانات المشتقة بتاعتنا مرخّصين بموجب'
  ),
  '. See': phrase('. راجع'),
  ". Outputs of TRIBE v2 inherit Meta's non-commercial terms, treat them accordingly.":
    phrase(
      '. تخضع مخرجات TRIBE v2 لشروط Meta غير التجارية، لذا يجب التعامل معها وفقًا لذلك.',
      '. مخرجات TRIBE v2 بتخضع لشروط Meta غير التجارية، فاتعامل معاها على الأساس ده.'
    ),
  'The proposed': phrase('النهج'),
  approach: phrase('المقترح'),
  "This is a research direction, not a working health service. We plan to relate residents' feedback to environmental data. Consent, privacy protections, sampling, and validation need to be established before collecting sensitive responses. The street imagery experiment above is a separate exploration.":
    phrase(
      'هذا اتجاه بحثي، وليس خدمة صحية عاملة. نخطط لربط آراء السكان بالبيانات البيئية. ويجب وضع أسس للموافقة وحماية الخصوصية وأخذ العينات والتحقق قبل جمع ردود حساسة. تجربة صور الشوارع أعلاه استكشاف منفصل.',
      'ده اتجاه بحثي، مش خدمة صحية شغّالة. بنخطط نربط آراء السكان بالبيانات البيئية. ولازم نحدد الموافقة وحماية الخصوصية وأخذ العينات والتحقق قبل ما نجمع ردود حساسة. تجربة صور الشوارع اللي فوق استكشاف منفصل.'
    ),
  'Questions about': phrase('أسئلة عن'),
  'daily life': phrase('الحياة اليومية'),
  'These are topics we are considering, not validated neighborhood scores. Choosing what to measure, and what each measure can tell us, is part of the research.':
    phrase(
      'هذه موضوعات ندرسها، وليست درجات معتمدة للأحياء. اختيار ما نقيسه وما الذي يستطيع كل مقياس إخبارنا به جزء من البحث.',
      'دي موضوعات بنفكر فيها، مش درجات أحياء متحقّق منها. اختيار هنقيس إيه وكل مقياس يقدر يقول لنا إيه جزء من البحث.'
    ),
  'Topics under consideration': phrase(
    'موضوعات قيد الدراسة',
    'موضوعات بنفكر فيها'
  ),
  'Research people can': phrase('بحث يستطيع الناس'),
  'inspect and question': phrase('فحصه ومساءلته', 'يراجعوه ويسألوا عنه'),
  "Explore our project code and the sources behind the experiment. Reuse depends on each source's license. Openness about methods does not mean publishing people's sensitive responses; the survey and data-sharing approach remain to be worked out.":
    phrase(
      'استكشف شفرة مشروعنا والمصادر وراء التجربة. تعتمد إعادة الاستخدام على ترخيص كل مصدر. الشفافية بشأن الطرق لا تعني نشر ردود الناس الحساسة؛ ولا يزال نهج الاستبيان ومشاركة البيانات بحاجة إلى تطوير.',
      'استكشف كود المشروع والمصادر ورا التجربة. إعادة الاستخدام بتعتمد على ترخيص كل مصدر. وضوح الطرق مش معناه نشر ردود الناس الحساسة؛ وطريقة الاستبيان ومشاركة البيانات لسه محتاجة شغل.'
    ),
  'While we build this': phrase('بينما نطوّر هذا العمل', 'وإحنا بنبني ده'),
  'The data foundation is already live. Explore terrain, population, buildings, and weather on our interactive globe — a starting point for investigating environmental context.':
    phrase(
      'أساس البيانات متاح بالفعل. استكشف التضاريس والسكان والمباني والطقس على كرتنا الأرضية التفاعلية — نقطة بداية لدراسة السياق البيئي.',
      'أساس البيانات شغّال فعلًا. استكشف التضاريس والسكان والمباني والطقس على الكوكب التفاعلي — نقطة بداية لدراسة السياق البيئي.'
    ),
  'Back home': phrase('العودة للرئيسية', 'ارجع للرئيسية'),
  'IoT sensors': phrase('مستشعرات إنترنت الأشياء'),
  'Air quality, temperature, light': phrase(
    'جودة الهواء والحرارة والضوء',
    'جودة الهوا والحرارة والضوء'
  ),
  'Residents’ experiences': phrase('تجارب السكان'),
  'Environmental and geographic context': phrase('السياق البيئي والجغرافي'),
  'Local context': phrase('السياق المحلي'),
  'Places and their surroundings': phrase('الأماكن ومحيطها'),
  'Survey safeguards': phrase('ضمانات الاستبيان'),
  'Consent and privacy to establish': phrase(
    'تأسيس الموافقة والخصوصية',
    'لازم نحدد الموافقة والخصوصية'
  ),
  'H3 hexagonal grid': phrase('شبكة H3 سداسية'),
  'Compare geographic context': phrase('مقارنة السياق الجغرافي'),
  'Reusable environmental datasets': phrase(
    'مجموعات بيانات بيئية قابلة لإعادة الاستخدام'
  ),
  'Research and validation': phrase('البحث والتحقق'),
  'Methods and limits to establish': phrase(
    'تحديد الطرق والحدود',
    'لازم نحدد الطرق والحدود'
  ),
  You: phrase('أنت', 'إنت'),
  'Understand local conditions': phrase(
    'فهم الظروف المحلية',
    'افهم الظروف المحلية'
  ),
  Families: phrase('العائلات'),
  'Ask about daily surroundings': phrase(
    'السؤال عن المحيط اليومي',
    'اسأل عن المحيط اليومي'
  ),
  Planners: phrase('المخططون', 'المخططين'),
  'Investigate local needs': phrase('دراسة الاحتياجات المحلية'),
  Researchers: phrase('الباحثون', 'الباحثين'),
  'Open datasets': phrase('مجموعات بيانات مفتوحة'),
  Policymakers: phrase('صنّاع السياسات'),
  'Examine environmental evidence': phrase('فحص الأدلة البيئية'),
  'Advocate with data': phrase('المناصرة بالبيانات', 'ادعم قضيتك بالبيانات'),
  'AI agents': phrase('وكلاء الذكاء الاصطناعي'),
  'Query published datasets': phrase('الاستعلام من مجموعات البيانات المنشورة'),
  People: phrase('الناس'),
  'Research and tools': phrase('البحث والأدوات'),
  'Water quality': phrase('جودة المياه'),
  'Power reliability': phrase('موثوقية الكهرباء'),
  'Air quality': phrase('جودة الهواء', 'جودة الهوا'),
  'Food access': phrase('الوصول إلى الغذاء'),
  Schools: phrase('المدارس'),
  Hospitals: phrase('المستشفيات'),
  'Public transport': phrase('النقل العام', 'المواصلات العامة'),
  'Green areas': phrase('المساحات الخضراء'),
  'Sun exposure': phrase('التعرّض للشمس'),
  'Building density': phrase('كثافة المباني'),
  'Light pollution': phrase('التلوث الضوئي'),
  'Stress levels': phrase('مستويات التوتر'),
  'Safety perception': phrase('الشعور بالأمان'),
  'Social connection': phrase('الترابط الاجتماعي'),
  'Happiness index': phrase('مؤشر السعادة'),
  'Climate adaptability': phrase('القدرة على التكيّف المناخي'),
  'Emergency preparedness': phrase('الاستعداد للطوارئ'),
  'Community cohesion': phrase('تماسك المجتمع'),
  'AI Chat Interface': phrase('واجهة محادثة بالذكاء الاصطناعي'),
  'City-Wide Trends Dashboard': phrase('لوحة اتجاهات على مستوى المدينة'),
  'Survey Categories': phrase('فئات الاستبيان'),
};

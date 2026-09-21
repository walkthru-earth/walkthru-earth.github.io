const phrase = (ar: string, arEG = ar) => ({ ar, arEG });

export const softwareMessages: Record<string, { ar: string; arEG: string }> = {
  'Urban Analysis Tools': phrase('أدوات التحليل الحضري', 'أدوات تحليل المدن'),
  'Tools for': phrase('أدوات من أجل', 'أدوات تساعدك على'),
  'Urban Discovery': phrase('اكتشاف المدن', 'اكتشاف المدينة'),
  'Free, open-source software designed to help researchers, planners, and communities detect patterns and understand how cities change over time.':
    phrase(
      'برمجيات حرة ومفتوحة المصدر، صُممت لمساعدة الباحثين والمخططين والمجتمعات على اكتشاف الأنماط وفهم كيف تتغير المدن مع مرور الوقت.',
      'برمجيات مجانية ومفتوحة المصدر، معمولة عشان تساعد الباحثين والمخططين والمجتمعات يكتشفوا الأنماط ويفهموا المدن بتتغير إزاي مع الوقت.'
    ),
  Free: phrase('مجاني'),
  Forever: phrase('دائمًا', 'على طول'),
  Open: phrase('مفتوح'),
  Source: phrase('المصدر'),
  Cross: phrase('متعدد'),
  Platform: phrase('المنصات'),
  'Historical Satellite Imagery Analysis': phrase(
    'تحليل صور الأقمار الصناعية التاريخية',
    'تحليل صور الأقمار الصناعية القديمة'
  ),
  'Download and georeference historical satellite imagery for urban analysis. Access decades of imagery to study how cities change over time.':
    phrase(
      'نزّل صور الأقمار الصناعية التاريخية واربطها بالإحداثيات الجغرافية للتحليل الحضري. استعرض صورًا تمتد لعقود لدراسة تغير المدن مع مرور الوقت.',
      'نزّل صور أقمار صناعية قديمة واربطها بالموقع الجغرافي لتحليل المدن. تقدر توصل لصور من عقود فاتت وتدرس المدن اتغيرت إزاي مع الوقت.'
    ),
  '1984-2025 imagery': phrase('صور من 1984 إلى 2025'),
  'GeoTIFF export': phrase('تصدير GeoTIFF'),
  'Interactive preview': phrase('معاينة تفاعلية'),
  'Fast downloads': phrase('تنزيل سريع'),
  Available: phrase('متاح'),
  Browser: phrase('المتصفح'),
  'Cloud Storage Explorer in the Browser': phrase(
    'مستكشف التخزين السحابي في المتصفح',
    'استكشف التخزين السحابي من المتصفح'
  ),
  'Browse, query, and visualize files in S3, GCS, Azure, R2, and more. SQL queries with DuckDB, interactive maps, and 100+ file format viewers -all client-side, zero backend.':
    phrase(
      'تصفّح الملفات في S3 وGCS وAzure وR2 وغيرها، واستعلم عنها واعرضها بصريًا. استعلامات SQL عبر DuckDB وخرائط تفاعلية وعارضات لأكثر من 100 صيغة ملفات—كلها تعمل لدى العميل دون خادم خلفي.',
      'تصفّح الملفات على S3 وGCS وAzure وR2 وغيرها، واعمل عليها استعلامات واعرضها بصريًا. استعلامات SQL بـ DuckDB وخرائط تفاعلية وعارضات لأكتر من 100 صيغة—كل ده بيشتغل عندك في المتصفح من غير خادم خلفي.'
    ),
  'SQL queries': phrase('استعلامات SQL'),
  '100+ formats': phrase('أكثر من 100 صيغة', 'أكتر من 100 صيغة'),
  'Geo visualization': phrase('عرض جغرافي بصري'),
  'Zero backend': phrase('بلا خادم خلفي', 'من غير خادم خلفي'),
  'Available for:': phrase('متاح لأنظمة:', 'متاح على:'),
  'Learn More': phrase('اعرف المزيد', 'اعرف أكتر'),
  'Built for': phrase('مصممة من أجل', 'معمولة عشان'),
  'People-First Discovery': phrase(
    'اكتشاف يضع الإنسان أولًا',
    'اكتشاف بيحط الناس في الأول'
  ),
  "Our software tools are designed to be free, accessible, and focused on detecting the hidden patterns that shape urban life. Whether you're a researcher studying urban growth, a planner analyzing environmental changes, or a community organizer documenting your neighborhood—these tools help you understand how cities evolve.":
    phrase(
      'صُممت أدواتنا البرمجية لتكون مجانية ومتاحة للجميع، وتركز على اكتشاف الأنماط الخفية التي تشكّل الحياة الحضرية. سواء كنت باحثًا يدرس النمو الحضري، أو مخططًا يحلل التغيرات البيئية، أو منظمًا مجتمعيًا يوثّق حيّه، تساعدك هذه الأدوات على فهم تطور المدن.',
      'أدواتنا البرمجية مجانية وسهلة الوصول، وتركّز على اكتشاف الأنماط الخفية اللي بتشكّل الحياة في المدن. سواء كنت باحث بيدرس نمو المدن، أو مخطط بيحلل التغيرات البيئية، أو منظم مجتمعي بيوثّق حيه، الأدوات دي هتساعدك تفهم المدن بتتطور إزاي.'
    ),
  'Learn About Our Vision': phrase('تعرّف على رؤيتنا', 'اعرف أكتر عن رؤيتنا'),
  'Imagery Desktop Icon': phrase('أيقونة Imagery Desktop'),
  'objex Icon': phrase('أيقونة objex'),

  'Back to Software': phrase('العودة إلى البرمجيات', 'ارجع للبرمجيات'),
  'Historical Pattern Detection': phrase(
    'اكتشاف الأنماط التاريخية',
    'اكتشاف الأنماط عبر الزمن'
  ),
  'See How Cities Change': phrase(
    'شاهد كيف تتغير المدن',
    'شوف المدن بتتغير إزاي'
  ),
  'Download and analyze historical satellite imagery from 1984 to 2025. Detect urban growth patterns, environmental changes, and community transformations over time.':
    phrase(
      'نزّل صور الأقمار الصناعية التاريخية من 1984 إلى 2025 وحلّلها. اكتشف أنماط النمو الحضري والتغيرات البيئية وتحولات المجتمعات مع مرور الوقت.',
      'نزّل وحلّل صور الأقمار الصناعية من 1984 لحد 2025. اكتشف أنماط نمو المدن والتغيرات البيئية وتحولات المجتمعات مع الوقت.'
    ),
  'Loading Downloads...': phrase(
    'جارٍ تحميل التنزيلات...',
    'بنجهّز التنزيلات...'
  ),
  'Apple Silicon only': phrase('لأجهزة Apple Silicon فقط'),
  'View on GitHub': phrase('عرض على GitHub', 'شوفه على GitHub'),
  'Version {version} • Released {date}': phrase(
    'الإصدار {version} • صدر في {date}',
    'الإصدار {version} • نزل في {date}'
  ),
  'Years of Imagery': phrase('عامًا من الصور', 'سنة من الصور'),
  'Data Sources': phrase('مصادر البيانات'),
  Key: phrase('أهم'),
  Features: phrase('الميزات', 'المزايا'),
  'Everything you need to analyze urban change through satellite imagery':
    phrase(
      'كل ما تحتاج إليه لتحليل التغير الحضري عبر صور الأقمار الصناعية',
      'كل اللي محتاجه عشان تحلل تغير المدن من صور الأقمار الصناعية'
    ),
  'Historical Imagery': phrase('الصور التاريخية', 'الصور القديمة'),
  'Access satellite imagery from 1984 to 2025 from Google Earth and Esri Wayback archives':
    phrase(
      'استعرض صور الأقمار الصناعية من 1984 إلى 2025 من أرشيفَي Google Earth وEsri Wayback',
      'تقدر توصل لصور الأقمار الصناعية من 1984 لحد 2025 من أرشيف Google Earth وEsri Wayback'
    ),
  'Interactive Map Preview': phrase('معاينة تفاعلية للخريطة'),
  'Preview imagery before download with MapLibre GL-powered visualization':
    phrase(
      'عاين الصور قبل تنزيلها من خلال عرض مرئي مدعوم بـ MapLibre GL',
      'عاين الصور قبل ما تنزّلها بعرض مرئي شغّال بـ MapLibre GL'
    ),
  'GeoTIFF Export': phrase('تصدير GeoTIFF'),
  'Export georeferenced GeoTIFF files ready for GIS analysis in QGIS or ArcGIS':
    phrase(
      'صدّر ملفات GeoTIFF مرتبطة بالإحداثيات وجاهزة لتحليل GIS في QGIS أو ArcGIS',
      'صدّر ملفات GeoTIFF مربوطة بالموقع وجاهزة لتحليل GIS على QGIS أو ArcGIS'
    ),
  'Social Media Ready': phrase('جاهز لمنصات التواصل'),
  'Create stunning timelapse videos perfect for Instagram, TikTok, YouTube, and other social platforms':
    phrase(
      'أنشئ فيديوهات تايم لابس مميزة ومناسبة لـ Instagram وTikTok وYouTube وغيرها من المنصات الاجتماعية',
      'اعمل فيديوهات تايم لابس مميزة تناسب Instagram وTikTok وYouTube ومنصات التواصل التانية'
    ),
  'Fast & Concurrent': phrase('سريع ومتزامن'),
  '10 parallel download workers with smart epoch fallback for reliable imagery':
    phrase(
      '10 عمليات تنزيل متوازية مع رجوع ذكي بين الحقب للحصول على صور موثوقة',
      '10 عمليات تنزيل شغالة بالتوازي مع رجوع ذكي بين الفترات عشان الصور تفضل موثوقة'
    ),
  'AI Ready': phrase('جاهز للذكاء الاصطناعي'),
  'Export imagery for AI video tools like Sora, Runway, and Kling to generate neighborhood explainers and urban analysis content':
    phrase(
      'صدّر الصور لأدوات فيديو الذكاء الاصطناعي مثل Sora وRunway وKling لإنشاء شروحات للأحياء ومحتوى للتحليل الحضري',
      'صدّر الصور لأدوات فيديو الذكاء الاصطناعي زي Sora وRunway وKling عشان تعمل شروحات للأحياء ومحتوى لتحليل المدن'
    ),
  'Browse historical imagery with an intuitive timeline. Select any date from 1984 to 2025 and preview imagery before download.':
    phrase(
      'تصفّح الصور التاريخية عبر خط زمني سهل الاستخدام. اختر أي تاريخ من 1984 إلى 2025 وعاين الصور قبل تنزيلها.',
      'تصفّح الصور القديمة بخط زمني سهل. اختار أي تاريخ من 1984 لحد 2025 وعاين الصور قبل ما تنزّلها.'
    ),
  'Split View Comparison': phrase('مقارنة بعرض منقسم'),
  'Compare imagery side-by-side across different dates. Analyze urban change, development patterns, and environmental shifts with precision.':
    phrase(
      'قارن الصور جنبًا إلى جنب بين تواريخ مختلفة. حلّل التغير الحضري وأنماط التطور والتحولات البيئية بدقة.',
      'قارن الصور جنب بعض في تواريخ مختلفة، وحلّل تغير المدن وأنماط التطور والتحولات البيئية بدقة.'
    ),
  'Video Timeline Export': phrase('تصدير الخط الزمني كفيديو'),
  'Create stunning timelapses showing urban transformation. Perfect for presentations, social media content, and storytelling on Instagram, TikTok, and YouTube.':
    phrase(
      'أنشئ فيديوهات تايم لابس مميزة تعرض التحول الحضري، ومناسبة للعروض التقديمية ومحتوى التواصل وسرد القصص على Instagram وTikTok وYouTube.',
      'اعمل فيديوهات تايم لابس مميزة بتعرض تغير المدن، ومناسبة للعروض ومحتوى التواصل والحكايات على Instagram وTikTok وYouTube.'
    ),
  'Create stunning timelapses showing urban transformation. Select date ranges and export smooth video transitions for presentations.':
    phrase(
      'أنشئ فيديوهات تايم لابس مميزة تعرض التحول الحضري. اختر نطاقات زمنية وصدّر انتقالات فيديو سلسة للعروض التقديمية.',
      'اعمل فيديوهات تايم لابس مميزة بتعرض تغير المدن. اختار الفترة وصدّر انتقالات فيديو سلسة للعروض.'
    ),
  'Flexible Export Options': phrase('خيارات تصدير مرنة'),
  'Export as GeoTIFF for GIS analysis, tiles for web maps, or videos for storytelling. Choose zoom levels and configure output precisely.':
    phrase(
      'صدّر بصيغة GeoTIFF لتحليل GIS، أو كشرائح لخرائط الويب، أو كفيديوهات لسرد القصص. اختر مستويات التكبير واضبط المخرجات بدقة.',
      'صدّر كـ GeoTIFF لتحليل GIS، أو شرائح لخرائط الويب، أو فيديوهات للحكايات. اختار مستويات التكبير واضبط الناتج بدقة.'
    ),
  'Background Task Queue': phrase('قائمة مهام الخلفية'),
  'Queue multiple exports and let them run in the background. Track progress, manage tasks, and download when ready.':
    phrase(
      'أضف عدة عمليات تصدير إلى قائمة الانتظار ودعها تعمل في الخلفية. تابع التقدم وأدِر المهام ونزّل النتائج عند جاهزيتها.',
      'ضيف أكتر من عملية تصدير للطابور وسيبها تشتغل في الخلفية. تابع التقدم ونظّم المهام ونزّل النتيجة لما تجهز.'
    ),
  'See It': phrase('شاهده', 'شوفه'),
  'In Action': phrase('أثناء العمل', 'وهو شغال'),
  'Powerful tools for detecting patterns in urban change': phrase(
    'أدوات قوية لاكتشاف أنماط التغير الحضري',
    'أدوات قوية لاكتشاف أنماط تغير المدن'
  ),
  Urban: phrase('تحوّل المدن', 'تغيّر المدن'),
  Timelapse: phrase('عبر الزمن', 'مع الوقت'),
  'Watch how Imagery Desktop creates stunning timelapses showing urban transformation over time':
    phrase(
      'شاهد كيف ينشئ Imagery Desktop فيديوهات تايم لابس مميزة تعرض التحول الحضري مع مرور الوقت',
      'شوف Imagery Desktop بيعمل فيديوهات تايم لابس مميزة إزاي عشان يعرض تغير المدن مع الوقت'
    ),
  'Silent satellite imagery timelapse showing urban change': phrase(
    'فيديو صامت متتابع لصور الأقمار الصناعية يعرض التغير الحضري',
    'فيديو صامت متتابع من صور الأقمار الصناعية بيوضح تغير المدن'
  ),
  'Your browser does not support the video tag.': phrase(
    'متصفحك لا يدعم تشغيل هذا الفيديو.',
    'متصفحك مش بيدعم تشغيل الفيديو ده.'
  ),
  'Esri Wayback timelapse: September 2025 to February 2021': phrase(
    'تايم لابس من Esri Wayback: من سبتمبر 2025 إلى فبراير 2021'
  ),
  'This software is open-source. The satellite imagery accessed through this application remains property of the respective providers (Google Earth, Esri) and their imagery partners. Users are responsible for complying with imagery provider terms of service.':
    phrase(
      'هذه البرمجية مفتوحة المصدر. تظل صور الأقمار الصناعية التي يتيحها التطبيق ملكًا لمزوديها المعنيين (Google Earth وEsri) وشركائهم في الصور. ويتحمل المستخدمون مسؤولية الالتزام بشروط خدمة مزودي الصور.',
      'البرنامج ده مفتوح المصدر. صور الأقمار الصناعية اللي بيوصل لها التطبيق بتفضل ملك لمزوديها (Google Earth وEsri) وشركائهم. والمستخدم مسؤول عن الالتزام بشروط خدمة مزودي الصور.'
    ),
  'Interactive Map Preview - Light Mode': phrase(
    'معاينة تفاعلية للخريطة - الوضع الفاتح'
  ),
  'Interactive Map Preview - Dark Mode': phrase(
    'معاينة تفاعلية للخريطة - الوضع الداكن'
  ),
  'Split View Comparison - Light Mode': phrase(
    'مقارنة بعرض منقسم - الوضع الفاتح'
  ),
  'Split View Comparison - Dark Mode': phrase(
    'مقارنة بعرض منقسم - الوضع الداكن'
  ),
  'Video Timeline Export - Light Mode': phrase(
    'تصدير الخط الزمني كفيديو - الوضع الفاتح'
  ),
  'Video Timeline Export - Dark Mode': phrase(
    'تصدير الخط الزمني كفيديو - الوضع الداكن'
  ),
  'Flexible Export Options - Light Mode': phrase(
    'خيارات تصدير مرنة - الوضع الفاتح'
  ),
  'Flexible Export Options - Dark Mode': phrase(
    'خيارات تصدير مرنة - الوضع الداكن'
  ),
  'Background Task Queue - Light Mode': phrase(
    'قائمة مهام الخلفية - الوضع الفاتح'
  ),
  'Background Task Queue - Dark Mode': phrase(
    'قائمة مهام الخلفية - الوضع الداكن'
  ),
  'Scroll to explore features': phrase(
    'مرّر لاستكشاف الميزات',
    'مرّر عشان تستكشف المزايا'
  ),

  'Copy URL': phrase('نسخ الرابط'),
  'Open in new tab': phrase('فتح في علامة تبويب جديدة', 'افتح في تبويب جديد'),
  'Cloud Storage Explorer': phrase('مستكشف التخزين السحابي'),
  'Explore Cloud Storage': phrase(
    'استكشف التخزين السحابي',
    'استكشف ملفاتك على السحابة'
  ),
  'Browse, query, and visualize files in S3, GCS, Azure, R2, and more. SQL queries with DuckDB, interactive geospatial maps, and 18+ specialized viewers for 100+ file formats -all running client-side in your browser.':
    phrase(
      'تصفّح الملفات في S3 وGCS وAzure وR2 وغيرها، واستعلم عنها واعرضها بصريًا. نفّذ استعلامات SQL عبر DuckDB واستخدم خرائط جغرافية تفاعلية وأكثر من 18 عارضًا متخصصًا لأكثر من 100 صيغة ملفات—وكلها تعمل لدى العميل في متصفحك.',
      'تصفّح الملفات على S3 وGCS وAzure وR2 وغيرها، واعمل عليها استعلامات واعرضها بصريًا. استخدم استعلامات SQL بـ DuckDB وخرائط جغرافية تفاعلية وأكتر من 18 عارض متخصص لأكتر من 100 صيغة—وكل ده بيشتغل عندك في المتصفح.'
    ),
  'Launch objex': phrase('تشغيل objex', 'افتح objex'),
  'File Formats': phrase('صيغ الملفات'),
  'Cloud Providers': phrase('مزودو الخدمات السحابية', 'مزودو السحابة'),
  Zero: phrase('بلا', 'من غير'),
  Backend: phrase('خادم خلفي'),
  'Everything you need to explore, query, and visualize cloud storage data':
    phrase(
      'كل ما تحتاج إليه لاستكشاف بيانات التخزين السحابي والاستعلام عنها وعرضها بصريًا',
      'كل اللي محتاجه عشان تستكشف بيانات التخزين السحابي وتعمل عليها استعلامات وتعرضها بصريًا'
    ),
  'Multi-Cloud Storage': phrase('تخزين متعدد السحابات'),
  'Connect to AWS S3, Google Cloud Storage, Azure Blob, Cloudflare R2, MinIO, Wasabi, DigitalOcean Spaces, and Storj':
    phrase(
      'اتصل بـ AWS S3 وGoogle Cloud Storage وAzure Blob وCloudflare R2 وMinIO وWasabi وDigitalOcean Spaces وStorj'
    ),
  'In-Browser SQL': phrase('SQL داخل المتصفح'),
  'Query Parquet, CSV, and JSONL with DuckDB-WASM -cancellable queries with full SQL support, all client-side':
    phrase(
      'استعلم عن Parquet وCSV وJSONL باستخدام DuckDB-WASM—استعلامات قابلة للإلغاء مع دعم SQL كامل، وتعمل كلها لدى العميل',
      'اعمل استعلامات على Parquet وCSV وJSONL بـ DuckDB-WASM—تقدر تلغي الاستعلامات ومعاك دعم SQL كامل، وكل ده شغال عندك في المتصفح'
    ),
  'Interactive Maps': phrase('خرائط تفاعلية'),
  'Visualize GeoParquet, GeoJSON, COG, PMTiles, FlatGeobuf, and Zarr on MapLibre GL + deck.gl maps':
    phrase(
      'اعرض GeoParquet وGeoJSON وCOG وPMTiles وFlatGeobuf وZarr بصريًا على خرائط MapLibre GL وdeck.gl'
    ),
  'Code & Notebooks': phrase('الشيفرة ودفاتر الملاحظات'),
  'Syntax-highlighted code in 30+ languages, Jupyter and marimo notebook rendering, Markdown preview':
    phrase(
      'تمييز بنية الشيفرة لأكثر من 30 لغة، وعرض دفاتر Jupyter وmarimo، ومعاينة Markdown',
      'تمييز الشيفرة بأكتر من 30 لغة، وعرض دفاتر Jupyter وmarimo، ومعاينة Markdown'
    ),
  'Point Clouds & Rasters': phrase('السحب النقطية والبيانات النقطية'),
  'Explore COPC, LAZ, and LAS point clouds. View Cloud Optimized GeoTIFFs, PMTiles, and Zarr v2/v3 rasters':
    phrase(
      'استكشف السحب النقطية بصيغ COPC وLAZ وLAS. واعرض البيانات النقطية بصيغ Cloud Optimized GeoTIFF وPMTiles وZarr v2/v3'
    ),
  '3D Models & Archives': phrase('النماذج ثلاثية الأبعاد والأرشيفات'),
  'Preview GLB, glTF, OBJ, STL, and FBX 3D models. Browse ZIP, TAR, GZ, 7Z, and RAR archives':
    phrase(
      'عاين النماذج ثلاثية الأبعاد بصيغ GLB وglTF وOBJ وSTL وFBX، وتصفّح أرشيفات ZIP وTAR وGZ و7Z وRAR'
    ),
  Internationalization: phrase('دعم اللغات'),
  'English and Arabic with automatic RTL layout. Designed for accessibility across languages':
    phrase(
      'الإنجليزية والعربية مع تخطيط RTL تلقائي، بتصميم يراعي سهولة الوصول عبر اللغات',
      'إنجليزي وعربي مع تخطيط RTL تلقائي، ومتعمّل عشان يكون سهل الاستخدام بكل اللغات'
    ),
  'Zero backend -everything runs in your browser. Credentials stay in memory and are never sent to any server':
    phrase(
      'بلا خادم خلفي—كل شيء يعمل في متصفحك. تبقى بيانات الاعتماد في الذاكرة ولا تُرسل إلى أي خادم',
      'من غير خادم خلفي—كل حاجة شغالة في متصفحك. بيانات الدخول بتفضل في الذاكرة ومابتتبعتش لأي خادم'
    ),
  'Parquet Explorer': phrase('مستكشف Parquet'),
  'Browse and visualize Parquet files with geospatial columns on interactive maps. Suitability analysis data rendered directly from S3-compatible storage.':
    phrase(
      'تصفّح ملفات Parquet ذات الأعمدة الجغرافية واعرضها على خرائط تفاعلية. تُعرض بيانات تحليل الملاءمة مباشرة من مساحة تخزين متوافقة مع S3.',
      'تصفّح ملفات Parquet اللي فيها أعمدة جغرافية واعرضها على خرائط تفاعلية. بيانات تحليل الملاءمة بتتعرض مباشرة من تخزين متوافق مع S3.'
    ),
  'COG Raster Visualization': phrase('عرض بيانات COG النقطية'),
  'Cloud Optimized GeoTIFFs rendered with deck.gl-raster and smart metadata detection via geotiff.js. National Land Cover Database (NLCD) 2024 visualized in the browser.':
    phrase(
      'تُعرض ملفات Cloud Optimized GeoTIFF باستخدام deck.gl-raster مع اكتشاف ذكي للبيانات الوصفية عبر geotiff.js. وتُعرض قاعدة بيانات الغطاء الأرضي الوطنية (NLCD) لعام 2024 داخل المتصفح.',
      'ملفات Cloud Optimized GeoTIFF بتتعرض بـ deck.gl-raster مع اكتشاف ذكي للبيانات الوصفية عن طريق geotiff.js. وكمان قاعدة بيانات الغطاء الأرضي الوطنية (NLCD) لسنة 2024 بتتعرض في المتصفح.'
    ),
  'Notebook Viewer': phrase('عارض دفاتر الملاحظات'),
  'Render Jupyter notebooks directly from cloud storage with full cell output display. Explore data science workflows without downloading anything.':
    phrase(
      'اعرض دفاتر Jupyter مباشرة من التخزين السحابي مع جميع مخرجات الخلايا. استكشف مسارات عمل علم البيانات دون تنزيل أي شيء.',
      'اعرض دفاتر Jupyter مباشرة من التخزين السحابي بكل مخرجات الخلايا. استكشف شغل علم البيانات من غير ما تنزّل أي حاجة.'
    ),
  'PMTiles Vector Maps': phrase('خرائط PMTiles المتجهة'),
  'Render PMTiles vector tile archives directly from cloud storage. Full OpenStreetMap worldwide rendered client-side with no tile server required.':
    phrase(
      'اعرض أرشيفات الشرائح المتجهة PMTiles مباشرة من التخزين السحابي. تُعرض OpenStreetMap الكاملة للعالم لدى العميل دون الحاجة إلى خادم شرائح.',
      'اعرض أرشيفات شرائح PMTiles مباشرة من التخزين السحابي. خريطة OpenStreetMap الكاملة للعالم بتتعرض عندك من غير ما تحتاج خادم شرائح.'
    ),
  'Zarr Multidimensional Arrays': phrase('مصفوفات Zarr متعددة الأبعاد'),
  'Inspect and explore Zarr v2/v3 stores from cloud storage. Browse array metadata, dimensions, and chunks for scientific datasets like GLDAS climate models.':
    phrase(
      'افحص مخازن Zarr v2/v3 واستكشفها من التخزين السحابي. تصفّح البيانات الوصفية للمصفوفات وأبعادها وأجزاءها لمجموعات بيانات علمية مثل نماذج المناخ GLDAS.',
      'افحص واستكشف مخازن Zarr v2/v3 من التخزين السحابي. تصفّح وصف المصفوفات وأبعادها وأجزاءها لبيانات علمية زي نماذج المناخ GLDAS.'
    ),
  'Markdown & Mermaid Rendering': phrase('عرض Markdown وMermaid'),
  'Render Markdown files with Mermaid diagram support and smart LTR/RTL detection for correct multilingual reading. Documentation rendered beautifully from any cloud storage.':
    phrase(
      'اعرض ملفات Markdown مع دعم مخططات Mermaid واكتشاف ذكي لاتجاهَي LTR وRTL لقراءة صحيحة بلغات متعددة. تُعرض الوثائق بصورة جميلة من أي تخزين سحابي.',
      'اعرض ملفات Markdown مع دعم مخططات Mermaid واكتشاف ذكي لاتجاه LTR وRTL عشان القراءة تكون صح بلغات مختلفة. الوثائق بتتعرض بشكل جميل من أي تخزين سحابي.'
    ),
  'Kepler.gl Map Viewer': phrase('عارض خرائط Kepler.gl'),
  'Load and render Kepler.gl JSON map configurations directly from cloud storage. Copernicus EGMS ground motion data visualized with full Kepler.gl interactivity.':
    phrase(
      'حمّل إعدادات خرائط Kepler.gl بصيغة JSON واعرضها مباشرة من التخزين السحابي. تُعرض بيانات حركة الأرض Copernicus EGMS مع كامل إمكانات Kepler.gl التفاعلية.',
      'حمّل إعدادات خرائط Kepler.gl بصيغة JSON واعرضها مباشرة من التخزين السحابي. بيانات حركة الأرض Copernicus EGMS بتتعرض بكل تفاعلات Kepler.gl.'
    ),
  'Archive Browser': phrase('متصفح الأرشيفات'),
  'Browse ZIP archives progressively without downloading or uncompressing. Inspect file trees, sizes, and contents in a clean column view -all streamed lazily from cloud storage.':
    phrase(
      'تصفّح أرشيفات ZIP تدريجيًا دون تنزيلها أو فك ضغطها. افحص أشجار الملفات وأحجامها ومحتوياتها في عرض أعمدة واضح—مع بث كل شيء عند الحاجة من التخزين السحابي.',
      'تصفّح أرشيفات ZIP بالتدريج من غير تنزيل أو فك ضغط. افحص شجرة الملفات وأحجامها ومحتواها في أعمدة واضحة—وكل حاجة بتتوصل وقت الحاجة من التخزين السحابي.'
    ),
  'STAC Catalog Browser': phrase('متصفح كتالوج STAC'),
  'Navigate SpatioTemporal Asset Catalogs directly from cloud storage. Browse collections, items, and assets with spatial previews -no STAC API server needed.':
    phrase(
      'تنقّل في كتالوجات الأصول المكانية والزمانية مباشرة من التخزين السحابي. تصفّح المجموعات والعناصر والأصول مع معاينات مكانية—دون الحاجة إلى خادم STAC API.',
      'تنقّل في كتالوجات الأصول المكانية والزمانية مباشرة من التخزين السحابي. تصفّح المجموعات والعناصر والأصول مع معاينات مكانية—من غير خادم STAC API.'
    ),
  'FlatGeobuf Streaming': phrase('بث FlatGeobuf'),
  'Stream large FlatGeobuf files with spatial filtering. This 6 GB EUBUCCO building footprint dataset for Austria is rendered progressively as data arrives.':
    phrase(
      'ابث ملفات FlatGeobuf الكبيرة مع ترشيح مكاني. تُعرض تدريجيًا مجموعة بيانات EUBUCCO لبصمات المباني في النمسا، وحجمها 6 GB، مع وصول البيانات.',
      'ابث ملفات FlatGeobuf الكبيرة مع فلترة مكانية. بيانات EUBUCCO لبصمات المباني في النمسا، وحجمها 6 GB، بتتعرض بالتدريج مع وصول البيانات.'
    ),
  'COPC Point Cloud Viewer': phrase('عارض السحب النقطية COPC'),
  'Explore Cloud-Optimized Point Cloud (COPC) files directly in the browser. This classified LiDAR dataset from Autzen is streamed and rendered as an interactive 3D point cloud.':
    phrase(
      'استكشف ملفات Cloud-Optimized Point Cloud (COPC) مباشرة في المتصفح. تُبث مجموعة بيانات LiDAR المصنفة من Autzen وتُعرض كسحابة نقطية ثلاثية الأبعاد تفاعلية.',
      'استكشف ملفات Cloud-Optimized Point Cloud (COPC) مباشرة في المتصفح. بيانات LiDAR المصنفة من Autzen بتتدفق وبتتعرض كسحابة نقطية 3D تفاعلية.'
    ),
  Live: phrase('مباشرةً', 'لايف'),
  'Interactive demos with real data from public cloud storage': phrase(
    'عروض تفاعلية ببيانات حقيقية من مساحات تخزين سحابية عامة',
    'تجارب تفاعلية ببيانات حقيقية من تخزين سحابي عام'
  ),
  Supported: phrase('الصيغ'),
  Formats: phrase('المدعومة'),
  'From tabular data and geospatial layers to 3D models and archives': phrase(
    'من البيانات الجدولية والطبقات الجغرافية إلى النماذج ثلاثية الأبعاد والأرشيفات',
    'من البيانات الجدولية والطبقات الجغرافية لحد النماذج 3D والأرشيفات'
  ),
  Tabular: phrase('بيانات جدولية'),
  'Geo Vector': phrase('بيانات جغرافية متجهة'),
  'Geo Raster': phrase('بيانات جغرافية نقطية'),
  'Point Cloud': phrase('سحب نقطية'),
  Notebooks: phrase('دفاتر الملاحظات'),
  Code: phrase('شيفرة برمجية', 'كود'),
  Documents: phrase('مستندات'),
  Media: phrase('وسائط'),
  Archives: phrase('أرشيفات'),
  Database: phrase('قاعدة بيانات'),
  Packages: phrase('الحزم'),
  'Use objex components and utilities in your own projects': phrase(
    'استخدم مكونات objex وأدواته المساعدة في مشروعاتك',
    'استخدم مكونات objex وأدواته في مشاريعك'
  ),
  'Full Svelte 5 component library with stores and utilities for building geospatial storage explorers.':
    phrase(
      'مكتبة كاملة من مكونات Svelte 5 تشمل المخازن والأدوات المساعدة لبناء مستكشفات التخزين الجغرافي.',
      'مكتبة كاملة من مكونات Svelte 5 فيها مخازن وأدوات تساعدك تبني مستكشفات للتخزين الجغرافي.'
    ),
  'Pure TypeScript utilities -zero Svelte dependency. Works with any JS framework or Node.js.':
    phrase(
      'أدوات TypeScript خالصة—دون أي اعتماد على Svelte. تعمل مع أي إطار JS أو مع Node.js.',
      'أدوات TypeScript خالصة—من غير أي اعتماد على Svelte. بتشتغل مع أي إطار JS أو Node.js.'
    ),
  'objex is open-source under CC BY 4.0. Everything runs client-side -your credentials and data never leave your browser.':
    phrase(
      'objex مفتوح المصدر بموجب CC BY 4.0. يعمل كل شيء لدى العميل، فلا تغادر بيانات اعتمادك وبياناتك متصفحك مطلقًا.',
      'objex مفتوح المصدر بترخيص CC BY 4.0. كل حاجة بتشتغل عندك، وبيانات الدخول وبياناتك مابتخرجش من متصفحك أبدًا.'
    ),
};

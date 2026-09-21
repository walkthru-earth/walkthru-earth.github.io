const phrase = (ar: string, arEG = ar) => ({ ar, arEG });

export const explorerMessages: Record<string, { ar: string; arEG: string }> = {
  'Loading Globe Explorer...': phrase(
    'جارٍ تحميل مستكشف الكرة الأرضية...',
    'بنحمّل مستكشف الكرة الأرضية...'
  ),
  'Layer controls': phrase('عناصر التحكم في الطبقات', 'تحكم في الطبقات'),
  Layers: phrase('الطبقات'),
  Satellite: phrase('صور الأقمار الصناعية', 'صور الأقمار الصناعية'),
  Land: phrase('اليابسة'),
  'Country Borders': phrase('حدود الدول'),
  Play: phrase('تشغيل', 'شغّل'),
  Pause: phrase('إيقاف مؤقت', 'وقّف مؤقتًا'),
  'Forecast timestep': phrase('الخطوة الزمنية للتنبؤ'),
  'Previous timestep': phrase('الخطوة الزمنية السابقة'),
  'Next timestep': phrase('الخطوة الزمنية التالية'),
  'Previous section': phrase('القسم السابق'),
  'Next section': phrase('القسم التالي'),
  'Go to section {number}': phrase(
    'الانتقال إلى القسم {number}',
    'روح للقسم {number}'
  ),
  'Section {current} of {total}: {title}': phrase(
    'القسم {current} من {total}: {title}'
  ),
  'Color scale from {start} to {end}': phrase(
    'مقياس الألوان من {start} إلى {end}'
  ),
  Data: phrase('البيانات'),
  Star: phrase('أضف نجمة', 'حط نجمة'),
  More: phrase('المزيد', 'أكتر'),
  Less: phrase('أقل', 'أقل'),
  Fetching: phrase('جارٍ الجلب...', 'بنجلب...'),
  Planning: phrase('جارٍ التخطيط...', 'بنخطط...'),
  Decoding: phrase('جارٍ فك الترميز...', 'بنفك الترميز...'),
  Filtering: phrase('جارٍ التصفية...', 'بنصفّي...'),
  Preparing: phrase('جارٍ التجهيز...', 'بنجهّز...'),
  Loading: phrase('جارٍ التحميل...', 'بنحمّل...'),
  '{count} rows': phrase('{count} صف', '{count} صف'),
  '{count} rows...': phrase('{count} صف...', '{count} صف...'),
  'querying...': phrase('جارٍ تنفيذ الاستعلام...', 'بنشغّل الاستعلام...'),
  'File size': phrase('حجم الملف'),
  Rows: phrase('الصفوف'),
  'Row groups': phrase('مجموعات الصفوف'),
  Version: phrase('الإصدار'),
  'Schema ({count} columns)': phrase('المخطط ({count} عمود)'),
  Column: phrase('العمود'),
  Type: phrase('النوع'),
  Codec: phrase('الترميز'),
  'Parquet file info': phrase('معلومات ملف Parquet'),
  'Parquet Metadata': phrase('بيانات Parquet الوصفية'),
  'SQL query': phrase('استعلام SQL'),
  'SQL Query': phrase('استعلام SQL'),
  'Clear location': phrase('مسح الموقع', 'امسح الموقع'),
  'Find my location': phrase('العثور على موقعي', 'حدّد موقعي'),
  'Decrease H3 resolution': phrase('خفض دقة H3', 'قلّل دقة H3'),
  'Increase H3 resolution': phrase('رفع دقة H3', 'زوّد دقة H3'),
  zoom: phrase('التكبير'),
  'h3 res': phrase('دقة H3'),
  'H3 res': phrase('دقة H3'),
  'Back to home': phrase('العودة إلى الرئيسية', 'ارجع للرئيسية'),
  'Increase to H3 resolution {resolution}?': phrase(
    'هل تريد رفع دقة H3 إلى {resolution}؟',
    'تزوّد دقة H3 لـ {resolution}؟'
  ),
  'Higher resolutions load significantly more data and may slow down or crash your browser depending on your device’s GPU and available memory.':
    phrase(
      'تُحمّل الدقات الأعلى بيانات أكثر بكثير، وقد تُبطئ المتصفح أو تتسبب في تعطله بحسب معالج الرسوميات والذاكرة المتاحة في جهازك.',
      'الدقة الأعلى بتحمّل بيانات أكتر بكتير، وممكن تبطّأ المتصفح أو توقفه حسب كارت الشاشة والذاكرة المتاحة في جهازك.'
    ),
  Cancel: phrase('إلغاء', 'إلغاء'),
  Continue: phrase('متابعة', 'كمّل'),
  'Your Location': phrase('موقعك'),
  'Loading data...': phrase('جارٍ تحميل البيانات...', 'بنحمّل البيانات...'),
  'No data at this resolution for your area': phrase(
    'لا توجد بيانات بهذه الدقة لمنطقتك',
    'مفيش بيانات بالدقة دي لمنطقتك'
  ),
  Temp: phrase('الحرارة'),
  Wind: phrase('الرياح'),
  Pressure: phrase('الضغط'),
  Direction: phrase('الاتجاه'),
  Precip: phrase('الهطول'),
  Elevation: phrase('الارتفاع'),
  Slope: phrase('الانحدار'),
  Buildings: phrase('المباني'),
  'Avg Height': phrase('متوسط الارتفاع'),
  'Pop 2025': phrase('السكان 2025'),
  'Pop 2050': phrase('السكان 2050'),
  'Pop 2100': phrase('السكان 2100'),
  Growth: phrase('النمو'),
  Density: phrase('الكثافة'),
  Coverage: phrase('التغطية'),
  Ruggedness: phrase('وعورة التضاريس'),
  Aspect: phrase('اتجاه المنحدر'),
  Volume: phrase('الحجم'),
  Footprint: phrase('المساحة الأرضية'),
  Change: phrase('التغير'),
  'Bldg/Person': phrase('مبانٍ/فرد'),
  'People/Bldg': phrase('أفراد/مبنى'),
  'Vol/Person': phrase('حجم/فرد'),
  'Total Volume': phrase('الحجم الإجمالي'),
  'Avg Building': phrase('متوسط مساحة المبنى'),
  Frame: phrase('الإطار', 'الفريم'),
  'Pick an image': phrase('اختر صورة', 'اختار صورة'),
  'no heading': phrase('بلا اتجاه', 'من غير اتجاه'),
  unknown: phrase('غير معروف', 'مش معروف'),
  'Mapillary frame {id}': phrase(
    'إطار Mapillary ‏{id}',
    'فريم Mapillary ‏{id}'
  ),
  'Selected frame': phrase('الإطار المحدد', 'الفريم المختار'),
  'Decoding…': phrase('جارٍ فك الترميز…', 'بنفك الترميز…'),
  'No image selected': phrase('لم تُحدَّد صورة', 'مفيش صورة مختارة'),
  'Frame walker': phrase('التنقل بين الإطارات', 'التنقل بين الفريمات'),
  'Previous frame': phrase('الإطار السابق', 'الفريم اللي فات'),
  'Next frame': phrase('الإطار التالي', 'الفريم اللي جاي'),
  'Pause auto-walk': phrase(
    'إيقاف التنقل التلقائي مؤقتًا',
    'وقّف التنقل التلقائي'
  ),
  'Auto-walk frames': phrase(
    'التنقل التلقائي بين الإطارات',
    'تنقّل تلقائي بين الفريمات'
  ),
  'Frame scrubber': phrase('شريط تمرير الإطارات', 'شريط تمرير الفريمات'),
  Frames: phrase('الإطارات', 'الفريمات'),
  'Strongest signal': phrase('أقوى إشارة'),
  'Auto-walk speed': phrase('سرعة التنقل التلقائي'),
  'Surface mode': phrase('وضع السطح'),
  Inflated: phrase('مُنتفخ'),
  Pial: phrase('حنوني'),
  'Source · Mapillary': phrase('المصدر · Mapillary'),
  'Sample area': phrase('منطقة العينة'),
  'London · Borough Market AOI': phrase('لندن · نطاق بورو ماركت'),
  'Tap a marker': phrase('اضغط على علامة', 'دوس على علامة'),
  'Model · TRIBE v2': phrase('النموذج · TRIBE v2'),
  'Predicted cortex · fsaverage5': phrase('القشرة المتوقعة · fsaverage5'),
  'Clear {feeling} spotlight': phrase(
    'إزالة تمييز «{feeling}»',
    'شيل تمييز «{feeling}»'
  ),
  'Clear spotlight (Esc)': phrase('إزالة التمييز (Esc)', 'شيل التمييز (Esc)'),
  Below: phrase('أدنى'),
  Above: phrase('أعلى'),
  '· per-frame 99th pct.': phrase(
    '· المئين 99 لكل إطار',
    '· المئين 99 لكل فريم'
  ),
  'Per-frame symmetric scale clipped to the 99th percentile of |activity|, mirrored around 0. Following the TRIBE v2 tutorial, we never quote absolute z values.':
    phrase(
      'مقياس متماثل لكل إطار، مقصوص عند المئين 99 من |النشاط| ومنعكس حول الصفر. وفق شرح TRIBE v2، لا نعرض قيم z مطلقة.',
      'مقياس متماثل لكل فريم، متقصوص عند المئين 99 من |النشاط| ومتعاكس حوالين الصفر. حسب شرح TRIBE v2، مش بنعرض قيم z مطلقة.'
    ),
  'Predicted response profile': phrase('ملف الاستجابة المتوقعة'),
  'Predicted regional response radar': phrase(
    'مخطط راداري للاستجابة المناطقية المتوقعة'
  ),
  baseline: phrase('خط الأساس'),
  'AOI σ': phrase('σ للنطاق'),
  'raw z': phrase('z خام'),
  'Raw z': phrase('z خام'),
  'Model response to this image': phrase('استجابة النموذج لهذه الصورة'),
  'σ units relative to this AOI’s baseline. +2σ = unusually high for that region.':
    phrase(
      'وحدات σ نسبةً إلى خط أساس هذا النطاق. ‏+2σ تعني ارتفاعًا غير معتاد لهذه المنطقة.',
      'وحدات σ مقارنة بخط أساس النطاق ده. ‏+2σ يعني ارتفاع مش معتاد للمنطقة دي.'
    ),
  'Raw model output. Switch to AOI σ for frame-relative readings.': phrase(
    'خرج النموذج الخام. انتقل إلى σ للنطاق لقراءات نسبية إلى الإطار.',
    'خرج النموذج الخام. اختار σ للنطاق عشان تشوف قراءة نسبية للفريم.'
  ),
  'Score scale': phrase('مقياس الدرجة'),
  'No regional summary': phrase('لا يوجد ملخص مناطقي', 'مفيش ملخص للمناطق'),
  below: phrase('أدنى من'),
  above: phrase('أعلى من'),
  '{feeling} {position} baseline': phrase('{feeling} {position} خط الأساس'),
  '{feeling} · {position} baseline': phrase('{feeling} · {position} خط الأساس'),
  'click to spotlight on the cortex': phrase(
    'انقر لإبرازه على القشرة',
    'دوس عشان تبرزه على القشرة'
  ),
  'Below baseline': phrase('أدنى من خط الأساس'),
  'Above baseline': phrase('أعلى من خط الأساس'),
  'London Borough Market street-level capture map': phrase(
    'خريطة اللقطات على مستوى الشارع في بورو ماركت بلندن'
  ),
  'Predicted cortical activity, fsaverage5 surface': phrase(
    'النشاط القشري المتوقع، سطح fsaverage5'
  ),
  'Loading cortex…': phrase('جارٍ تحميل القشرة…', 'بنحمّل القشرة…'),
  'Cortex ready': phrase('القشرة جاهزة'),
  'Fetching parquet…': phrase('جارٍ جلب Parquet…', 'بنجلب Parquet…'),
  'Decoding image blobs and cortical maps…': phrase(
    'جارٍ فك ترميز الصور وخرائط القشرة…',
    'بنفك ترميز الصور وخرائط القشرة…'
  ),
  'Loaded {count} images': phrase(
    'تم تحميل {count} صورة',
    'اتحمّل {count} صورة'
  ),
  'Cache ready · {count} frames': phrase(
    'ذاكرة التخزين جاهزة · {count} إطار',
    'الكاش جاهز · {count} فريم'
  ),
  'Parquet error: {message}': phrase('خطأ في Parquet: {message}'),
  'Heavy decode error: {message}': phrase(
    'خطأ في فك الترميز الثقيل: {message}'
  ),
  'Cortex load error: {message}': phrase('خطأ في تحميل القشرة: {message}'),
  'Global Temperature': phrase('درجة الحرارة العالمية', 'حرارة العالم'),
  'AI Weather · GraphCast': phrase('طقس بالذكاء الاصطناعي · GraphCast'),
  'AI-powered weather from NOAA GraphCast. 21 forecast timesteps, updated every 12 hours. Each hexagon carries temperature, wind speed, and pressure.':
    phrase(
      'طقس مدعوم بالذكاء الاصطناعي من NOAA GraphCast. يتضمن 21 خطوة زمنية للتنبؤ ويُحدَّث كل 12 ساعة. تحمل كل خلية سداسية درجة الحرارة وسرعة الرياح والضغط.',
      'طقس بالذكاء الاصطناعي من NOAA GraphCast. فيه 21 خطوة تنبؤ وبيتحدّث كل 12 ساعة. كل خلية سداسية فيها الحرارة وسرعة الرياح والضغط.'
    ),
  'Wind Patterns': phrase('أنماط الرياح'),
  'AI Weather · 10m Winds': phrase(
    'طقس بالذكاء الاصطناعي · رياح على ارتفاع 10 م'
  ),
  'Surface wind speeds at 10m above ground. Trade winds, westerlies, and storm systems. Each hexagon carries speed and direction vectors.':
    phrase(
      'سرعات الرياح السطحية على ارتفاع 10 أمتار فوق الأرض، بما فيها الرياح التجارية والغربية وأنظمة العواصف. تحمل كل خلية سداسية متجهي السرعة والاتجاه.',
      'سرعة الرياح السطحية على ارتفاع 10 متر، بما فيها الرياح التجارية والغربية والعواصف. كل خلية سداسية فيها السرعة والاتجاه.'
    ),
  'Atmospheric Pressure': phrase('الضغط الجوي'),
  'AI Weather · Sea Level': phrase('طقس بالذكاء الاصطناعي · مستوى سطح البحر'),
  'Mean sea level pressure from GraphCast AI. Low pressure brings storms and barometric changes. A known trigger for migraines and mood shifts. High pressure brings calm.':
    phrase(
      'متوسط ضغط مستوى سطح البحر من GraphCast. يجلب الضغط المنخفض العواصف والتغيرات البارومترية، وقد يحفز الصداع النصفي وتقلب المزاج. أما الضغط المرتفع فيجلب الهدوء.',
      'متوسط ضغط سطح البحر من GraphCast. الضغط الواطي بيجيب عواصف وتغيرات جوية وممكن يحفّز الصداع النصفي وتغيّر المزاج، والضغط العالي بيجيب هدوء.'
    ),
  Precipitation: phrase('الهطول'),
  'AI Weather · Rain Only': phrase('طقس بالذكاء الاصطناعي · أمطار فقط'),
  'Accumulated precipitation (mm/6hr) from GraphCast AI with orographic correction. Only raining hexagons (>0.1 mm) are shown — dry cells hidden. Validated against Open-Meteo. Updated every 12 hours.':
    phrase(
      'الهطول المتراكم (مم/6 ساعات) من GraphCast مع تصحيح تضاريسي. تظهر فقط الخلايا الممطرة (>0.1 مم) وتُخفى الخلايا الجافة. جرى التحقق منه مقابل Open-Meteo ويُحدَّث كل 12 ساعة.',
      'المطر المتراكم (مم/6 ساعات) من GraphCast مع تصحيح التضاريس. بنعرض الخلايا اللي فيها مطر بس (>0.1 مم)، والخلايا الجافة مخفية. متراجع مع Open-Meteo وبيتحدّث كل 12 ساعة.'
    ),
  'Terrain & Elevation': phrase('التضاريس والارتفاع'),
  Himalayas: phrase('الهيمالايا'),
  'Elevation from the GEDTM-30m global terrain model. Five metrics per hexagon: elevation, slope, aspect, TRI, and TPI. 183 GB across 10.5 billion cells.':
    phrase(
      'الارتفاع من نموذج التضاريس العالمي GEDTM-30m. خمسة مقاييس لكل خلية سداسية: الارتفاع والانحدار والاتجاه وTRI وTPI. ‏183 جيجابايت موزعة على 10.5 مليار خلية.',
      'الارتفاع من نموذج التضاريس العالمي GEDTM-30m. كل خلية سداسية فيها خمس قياسات: الارتفاع والانحدار والاتجاه وTRI وTPI. ‏183 جيجابايت على 10.5 مليار خلية.'
    ),
  'Urban Density': phrase('الكثافة الحضرية'),
  'Nile Delta · Cairo': phrase('دلتا النيل · القاهرة'),
  '2.75 billion buildings from the Global Building Atlas, joined with SSP2 population projections. 12 columns per cell: count, density, footprint, height, volume, coverage ratio.':
    phrase(
      'بيانات 2.75 مليار مبنى من أطلس المباني العالمي، مدمجة مع إسقاطات السكان SSP2. لكل خلية 12 عمودًا تشمل العدد والكثافة والمساحة والارتفاع والحجم ونسبة التغطية.',
      'بيانات 2.75 مليار مبنى من أطلس المباني العالمي، متوصلة بتوقعات السكان SSP2. كل خلية فيها 12 عمود للعدد والكثافة والمساحة والارتفاع والحجم ونسبة التغطية.'
    ),
  'Population Growth 2025→2100': phrase('النمو السكاني 2025→2100'),
  'Sub-Saharan Africa': phrase('أفريقيا جنوب الصحراء'),
  'Population projections under SSP2 from WorldPop. Sub-Saharan Africa shows the most dramatic growth. Some hexagons tripling by 2100.':
    phrase(
      'إسقاطات سكانية وفق SSP2 من WorldPop. تُظهر أفريقيا جنوب الصحراء أكبر نمو، مع تضاعف بعض الخلايا ثلاث مرات بحلول 2100.',
      'توقعات السكان حسب SSP2 من WorldPop. أفريقيا جنوب الصحراء فيها أكبر نمو، وبعض الخلايا عدد سكانها هيتضاعف 3 مرات بحلول 2100.'
    ),
  'Building Density': phrase('كثافة المباني'),
  'Tokyo · East Asia': phrase('طوكيو · شرق آسيا'),
  "Tokyo-Yokohama, the world's largest metro. Each hexagon reports 12 metrics: count, density, footprint, height, volume, and coverage ratio.":
    phrase(
      'طوكيو-يوكوهاما، أكبر منطقة حضرية في العالم. تعرض كل خلية سداسية 12 مقياسًا، منها العدد والكثافة والمساحة والارتفاع والحجم ونسبة التغطية.',
      'طوكيو-يوكوهاما، أكبر منطقة حضرية في العالم. كل خلية سداسية بتعرض 12 قياس، منها العدد والكثافة والمساحة والارتفاع والحجم ونسبة التغطية.'
    ),
  'Buildings on Steep Terrain': phrase('مبانٍ على تضاريس شديدة الانحدار'),
  'Himalayan Slopes': phrase('منحدرات الهيمالايا'),
  'Cross-joining buildings with terrain slope to flag structures on steep ground. Slope is one screening signal, not a site-level stability or hazard assessment.':
    phrase(
      'دمج المباني مع انحدار التضاريس للإشارة إلى المنشآت على أرض شديدة الانحدار. الانحدار إشارة فحص أولية واحدة، وليس تقييمًا لاستقرار الموقع أو أخطاره.',
      'ربط المباني بانحدار الأرض عشان نحدد المنشآت على أرض شديدة الميل. الانحدار مجرد مؤشر فحص أولي، مش تقييم لاستقرار الموقع أو خطورته.'
    ),
  'Vertical Living Index': phrase('مؤشر السكن الرأسي'),
  'Pearl River Delta': phrase('دلتا نهر اللؤلؤ'),
  'Buildings per person is a rough proxy for how many people share built space. It does not measure crowding inside homes, stress, or mental health.':
    phrase(
      'عدد المباني لكل فرد مؤشر تقريبي لعدد الأشخاص الذين يتشاركون المساحة المبنية. وهو لا يقيس الازدحام داخل المنازل أو الضغط النفسي أو الصحة النفسية.',
      'عدد المباني لكل شخص مؤشر تقريبي لعدد الناس اللي بيشاركوا المساحة المبنية. هو مش بيقيس الزحمة جوه البيوت ولا الضغط النفسي ولا الصحة النفسية.'
    ),
  'Shrinking Cities': phrase('مدن آخذة في الانكماش'),
  'East Asia · 2025→2100': phrase('شرق آسيا · 2025→2100'),
  'Cells where population will decline under SSP2. Shrinking cities face abandoned infrastructure, aging populations, and the quiet stress of emptying neighborhoods.':
    phrase(
      'خلايا يُتوقع انخفاض سكانها وفق SSP2. تواجه المدن المنكمشة بنية تحتية مهجورة وشيخوخة سكانية والضغط الهادئ الناتج عن فراغ الأحياء.',
      'خلايا متوقع عدد سكانها يقل حسب SSP2. المدن اللي بتنكمش بتواجه بنية تحتية مهجورة وسكان أكبر سنًا وضغط هادي مع فضيان الأحياء.'
    ),
  'Terrain Slope': phrase('انحدار التضاريس'),
  'Global Surface Gradient': phrase('انحدار سطح الأرض عالميًا'),
  'Average slope in degrees per cell. Slope determines walkability, buildability, flood drainage, and landslide risk. The invisible topography beneath every city.':
    phrase(
      'متوسط الانحدار بالدرجات لكل خلية. يحدد الانحدار قابلية المشي والبناء وتصريف الفيضانات وخطر الانهيارات الأرضية؛ إنه الطبوغرافيا الخفية تحت كل مدينة.',
      'متوسط انحدار كل خلية بالدرجات. الانحدار بيحدد سهولة المشي والبناء وتصريف السيول وخطر الانهيارات؛ دي التضاريس المستخبية تحت كل مدينة.'
    ),
  'Terrain Ruggedness': phrase('وعورة التضاريس'),
  'Karakoram · TRI Index': phrase('قراقرم · مؤشر TRI'),
  'Terrain Ruggedness Index (TRI). Measuring elevation variability within each cell. High TRI means gorges, ridgelines, and cliff faces. Rugged terrain shapes accessibility and isolation.':
    phrase(
      'مؤشر وعورة التضاريس (TRI)، ويقيس تغير الارتفاع داخل كل خلية. تعني القيم المرتفعة وجود أخاديد وحواف جبلية وجروف؛ وتحدد التضاريس الوعرة سهولة الوصول والعزلة.',
      'مؤشر وعورة التضاريس (TRI) بيقيس اختلاف الارتفاع جوه كل خلية. القيمة العالية معناها أخاديد وحواف وجروف، والوعورة بتأثر على الوصول والعزلة.'
    ),
  'Built Volume': phrase('الحجم المبني'),
  'Pearl River Delta · Concrete Mass': phrase(
    'دلتا نهر اللؤلؤ · كتلة الخرسانة'
  ),
  'Total building volume (footprint × height) per hexagon. The physical mass of the built environment made visible.':
    phrase(
      'إجمالي حجم المباني (المساحة × الارتفاع) لكل خلية سداسية، لإظهار الكتلة المادية للبيئة المبنية.',
      'إجمالي حجم المباني (المساحة × الارتفاع) في كل خلية سداسية، عشان نشوف الكتلة الحقيقية للبيئة المبنية.'
    ),
  'Ground Coverage': phrase('تغطية الأرض'),
  'Jakarta · Building Footprint': phrase('جاكرتا · مساحة المباني'),
  'What fraction of the ground is covered by buildings? High coverage means less green space, more heat retention, and less room for the nature that reduces cortisol by 21% per hour.':
    phrase(
      'ما نسبة الأرض التي تغطيها المباني؟ تعني التغطية العالية مساحات خضراء أقل واحتباسًا حراريًا أكبر وحيزًا أقل للطبيعة التي تخفض الكورتيزول بنسبة 21% في الساعة.',
      'قد إيه من الأرض متغطي بالمباني؟ التغطية العالية معناها خضرة أقل وحرارة محبوسة أكتر ومساحة أقل للطبيعة اللي بتقلل الكورتيزول 21% في الساعة.'
    ),
  'Built Volume Per Person': phrase('الحجم المبني لكل فرد'),
  'Kinshasa · 4.8 m³/person': phrase('كينشاسا · 4.8 م³/فرد'),
  'Total building volume divided by population. How much built space exists per person. These numbers quantify the spatial compression that shapes stress, sleep, and social behavior.':
    phrase(
      'إجمالي حجم المباني مقسومًا على عدد السكان: مقدار المساحة المبنية المتاحة لكل فرد. تقيس هذه الأرقام الانضغاط المكاني المؤثر في الضغط والنوم والسلوك الاجتماعي.',
      'إجمالي حجم المباني مقسوم على السكان: مساحة البناء المتاحة لكل شخص. الأرقام دي بتقيس ضغط المكان اللي بيأثر على التوتر والنوم والسلوك الاجتماعي.'
    ),
  'Places & Amenities': phrase('الأماكن والخدمات'),
  'Overture Maps · 72 M POIs': phrase('خرائط Overture · ‏72 مليون نقطة اهتمام'),
  'Every restaurant, school, hospital, park, and shop on Earth — aggregated from Overture Maps into H3 hexagons. Height = total POI count, color = Shannon diversity across 13 categories. High diversity (purple) marks self-sufficient neighborhoods; low diversity (cream) marks mono-functional zones.':
    phrase(
      'كل مطعم ومدرسة ومستشفى وحديقة ومتجر على الأرض، مجمعة من خرائط Overture في خلايا H3 سداسية. الارتفاع = إجمالي نقاط الاهتمام، واللون = تنوع شانون عبر 13 فئة. يشير التنوع العالي (البنفسجي) إلى أحياء مكتفية، والمنخفض (الكريمي) إلى مناطق أحادية الوظيفة.',
      'كل مطعم ومدرسة ومستشفى وحديقة ومحل على الأرض، متجمعين من خرائط Overture في خلايا H3. الارتفاع هو عدد الأماكن، واللون هو تنوع شانون في 13 فئة. البنفسجي أحياء متنوعة ومكتفية، والكريمي مناطق بوظيفة واحدة.'
    ),
  'Walkability Index': phrase('مؤشر قابلية المشي'),
  '5 Signals · 4 Indices': phrase('5 إشارات · 4 مؤشرات'),
  '15-Minute City Score': phrase('درجة مدينة الـ15 دقيقة'),
  '7 Signals · 4 Indices': phrase('7 إشارات · 4 مؤشرات'),
  'Housing Pressure 2025→2100': phrase('ضغط الإسكان 2025→2100'),
  'Where population will grow fastest with the fewest buildings per person. Cross-index joining buildings with SSP2 projections. Revealing future housing crises decades in advance.':
    phrase(
      'المناطق التي سينمو سكانها بأسرع وتيرة مع أقل عدد من المباني لكل فرد. يدمج المؤشر بيانات المباني مع إسقاطات SSP2 لكشف أزمات السكن المستقبلية قبل عقود.',
      'أماكن السكان فيها هيزيدوا أسرع مع أقل عدد مباني لكل شخص. المؤشر بيربط المباني بتوقعات SSP2 عشان يكشف أزمات السكن قبلها بسنين طويلة.'
    ),
  'Biophilic Index': phrase('مؤشر الارتباط بالطبيعة'),
  'Nature Access × Population': phrase('الوصول إلى الطبيعة × السكان'),
  'Urban Heat Vulnerability': phrase('الهشاشة أمام الحرارة الحضرية'),
  '6 Indices · Concrete × Asphalt × Nature × Weather': phrase(
    '6 مؤشرات · الخرسانة × الأسفلت × الطبيعة × الطقس'
  ),
  'Water Security': phrase('الأمن المائي'),
  '6 Signals · 5 Indices': phrase('6 إشارات · 5 مؤشرات'),
  'Forecast Horizon': phrase('أفق التنبؤ'),
  'Update Frequency': phrase('وتيرة التحديث'),
  'Source Resolution': phrase('دقة المصدر'),
  'Total Buildings': phrase('إجمالي المباني'),
  Projection: phrase('الإسقاط'),
  'Metro Population': phrase('سكان المنطقة الحضرية'),
  'Max Slope': phrase('أقصى انحدار'),
  'Min Bldg/Person': phrase('أقل مبانٍ/فرد'),
  'Steepest Decline': phrase('أشد انخفاض'),
  'Steepest Cell': phrase('أشد خلية انحدارًا'),
  'Max TRI': phrase('أقصى TRI'),
  'Max Volume': phrase('أقصى حجم'),
  'Max Coverage': phrase('أقصى تغطية'),
  'Min Volume': phrase('أقل حجم'),
  'Total POIs': phrase('إجمالي نقاط الاهتمام'),
  'Total Segments': phrase('إجمالي المقاطع'),
  Signals: phrase('الإشارات'),
  'Max Growth': phrase('أقصى نمو'),
  'Nature Features': phrase('المعالم الطبيعية'),
  'Risk Factors': phrase('عوامل الخطر'),
  Calm: phrase('هادئ'),
  Sparse: phrase('متناثر'),
  Declining: phrase('متراجع'),
  Stable: phrase('مستقر'),
  '3x Growth': phrase('نمو 3×'),
  'Low-rise': phrase('منخفض الارتفاع'),
  'Mid-rise': phrase('متوسط الارتفاع'),
  'High-rise': phrase('مرتفع'),
  Spacious: phrase('رحب'),
  '0 (smooth)': phrase('0 (ناعم)'),
  '300 (extreme)': phrase('300 (شديد)'),
  Low: phrase('منخفض'),
  Medium: phrase('متوسط'),
  High: phrase('مرتفع'),
  Mono: phrase('أحادي'),
  Mixed: phrase('مختلط'),
  Diverse: phrase('متنوع'),
  Car: phrase('سيارة'),
  Walkable: phrase('ملائم للمشي'),
  Deprived: phrase('محروم'),
  Balanced: phrase('متوازن'),
  'Nature-rich': phrase('غني بالطبيعة'),
  Moderate: phrase('متوسط'),
  Extreme: phrase('شديد'),
  Critical: phrase('حرج'),
  Secure: phrase('آمن'),
  '5 days': phrase('5 أيام'),
  '12 hrs': phrase('12 ساعة'),
  '30m': phrase('30 م'),
  '118 M': phrase('118 مليون'),
  '72 M': phrase('72 مليون'),
  '343 M': phrase('343 مليون'),
  '13.6B m³': phrase('13.6 مليار م³'),
  '0.001 m³/person': phrase('0.001 م³/فرد'),
};

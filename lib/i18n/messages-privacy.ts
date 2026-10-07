// Translate the existing policy faithfully; changes to policy meaning are separate.
const phrase = (ar: string, arEG = ar) => ({ ar, arEG });

export const privacyMessages: Record<string, { ar: string; arEG: string }> = {
  'Privacy First': phrase('الخصوصية أولًا'),
  'Privacy Policy': phrase('سياسة الخصوصية'),
  'At walkthru.earth, we believe privacy is a fundamental right. This policy explains how we collect, use, and protect your information across our platforms.':
    phrase(
      'نؤمن في walkthru.earth بأن الخصوصية حق أساسي. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عبر منصاتنا.',
      'في walkthru.earth، بنؤمن إن الخصوصية حق أساسي. السياسة دي بتوضح إزاي بنجمع معلوماتك ونستخدمها ونحميها على منصاتنا.'
    ),
  'Last updated:': phrase('آخر تحديث:'),
  'November 30, 2025': phrase('30 نوفمبر 2025'),
  Contents: phrase('المحتويات'),
  Overview: phrase('نظرة عامة'),
  'What We Collect': phrase('المعلومات التي نجمعها', 'المعلومات اللي بنجمعها'),
  'How We Use Information': phrase(
    'كيف نستخدم المعلومات',
    'بنستخدم المعلومات إزاي'
  ),
  'Cookies & Analytics': phrase('ملفات تعريف الارتباط والتحليلات'),
  'Information Sharing': phrase('مشاركة المعلومات'),
  'Open Data Principles': phrase('مبادئ البيانات المفتوحة'),
  'Your Rights': phrase('حقوقك'),
  'Data Security': phrase('أمن البيانات'),
  "Children's Privacy": phrase('خصوصية الأطفال'),
  'Policy Changes': phrase('تغييرات السياسة'),
  'Contact Us': phrase('تواصل معنا', 'تواصل معانا'),
  'This Privacy Policy applies to walkthru.earth and its associated platforms, including':
    phrase(
      'تسري سياسة الخصوصية هذه على walkthru.earth والمنصات المرتبطة بها، بما فيها',
      'سياسة الخصوصية دي بتسري على walkthru.earth والمنصات المرتبطة بيها، ومنها'
    ),
  and: phrase('و'),
  '. We are committed to transparency and prioritize your privacy in everything we do.':
    phrase(
      '. نلتزم بالشفافية ونجعل خصوصيتك أولوية في جميع أعمالنا.',
      '. إحنا ملتزمين بالشفافية وبندي خصوصيتك الأولوية في كل اللي بنعمله.'
    ),
  'Our mission is to detect hidden patterns of daily life and turn them into people-first solutions that support wellbeing in cities. We achieve this while maintaining the highest standards of data protection and ethical data practices.':
    phrase(
      'مهمتنا اكتشاف الأنماط الخفية في الحياة اليومية وتحويلها إلى حلول تضع الإنسان أولًا وتدعم جودة الحياة في المدن. ونحقق ذلك مع الحفاظ على أعلى معايير حماية البيانات والممارسات الأخلاقية في التعامل معها.',
      'مهمتنا نكتشف الأنماط الخفية في حياتنا اليومية ونحوّلها لحلول بتحط الناس في الأول وبتدعم جودة الحياة في المدن. وبنعمل ده مع الحفاظ على أعلى معايير حماية البيانات والتعامل الأخلاقي معاها.'
    ),
  'Website Analytics (Cookieless by Default)': phrase(
    'تحليلات الموقع (دون ملفات تعريف ارتباط افتراضيًا)',
    'تحليلات الموقع (من غير ملفات تعريف ارتباط بشكل افتراضي)'
  ),
  'We use a cookieless-first approach to analytics. Before you consent to cookies, we collect only anonymous, aggregated data that cannot identify you personally:':
    phrase(
      'نعتمد في التحليلات نهجًا يبدأ دون ملفات تعريف ارتباط. قبل موافقتك عليها، نجمع فقط بيانات مجمّعة ومجهولة الهوية لا يمكن استخدامها للتعرّف عليك شخصيًا:',
      'بنبدأ التحليلات من غير ملفات تعريف ارتباط. قبل ما توافق عليها، بنجمع بس بيانات مجمّعة ومجهولة الهوية ماينفعش تتحدد منها هويتك الشخصية:'
    ),
  'Page views and navigation patterns': phrase(
    'مشاهدات الصفحات وأنماط التنقل بينها',
    'زيارات الصفحات وطريقة التنقل بينها'
  ),
  'General geographic region (country level)': phrase(
    'المنطقة الجغرافية العامة (على مستوى الدولة)'
  ),
  'Device type and browser information': phrase('نوع الجهاز ومعلومات المتصفح'),
  'Referral sources': phrase('مصادر الإحالة', 'المصادر اللي جابت الزيارة'),
  'With Your Consent (Cookies Accepted)': phrase(
    'بموافقتك (عند قبول ملفات تعريف الارتباط)',
    'بموافقتك (لما توافق على ملفات تعريف الارتباط)'
  ),
  'If you accept analytics cookies, we may collect additional information to improve our services:':
    phrase(
      'إذا وافقت على ملفات تعريف الارتباط للتحليلات، فقد نجمع معلومات إضافية لتحسين خدماتنا:',
      'لو وافقت على ملفات تعريف الارتباط للتحليلات، ممكن نجمع معلومات إضافية عشان نحسّن خدماتنا:'
    ),
  'Session duration and engagement metrics': phrase(
    'مدة الجلسة ومقاييس التفاعل'
  ),
  'Feature usage patterns': phrase(
    'أنماط استخدام الميزات',
    'طريقة استخدام المزايا'
  ),
  'Returning visitor recognition': phrase(
    'التعرّف على الزوار العائدين',
    'التعرّف على الزوار اللي رجعوا للموقع'
  ),
  'OpenSensor.Space (IoT Sensor Data)': phrase(
    'OpenSensor.Space (بيانات مستشعرات إنترنت الأشياء)'
  ),
  'Our IoT sensor network collects environmental data only:': phrase(
    'تجمع شبكة مستشعرات إنترنت الأشياء لدينا بيانات بيئية فقط:',
    'شبكة مستشعرات إنترنت الأشياء عندنا بتجمع بيانات بيئية بس:'
  ),
  'Temperature, humidity, and air quality measurements': phrase(
    'قياسات درجة الحرارة والرطوبة وجودة الهواء'
  ),
  'Atmospheric pressure and weather conditions': phrase(
    'الضغط الجوي وحالة الطقس'
  ),
  'Sensor location (geographic coordinates of the device)': phrase(
    'موقع المستشعر (الإحداثيات الجغرافية للجهاز)'
  ),
  'Timestamp of measurements': phrase('التوقيت المسجّل للقياسات'),
  'This data is environmental in nature and does not include any personal information. Sensor operators voluntarily contribute their data to our open network.':
    phrase(
      'هذه البيانات بيئية بطبيعتها ولا تتضمن أي معلومات شخصية. يساهم مشغّلو المستشعرات ببياناتهم طوعًا في شبكتنا المفتوحة.',
      'البيانات دي بيئية بطبيعتها ومش بتشمل أي معلومات شخصية. مشغّلو المستشعرات بيشاركوا بياناتهم طوعًا في شبكتنا المفتوحة.'
    ),
  'CapyBrain Survey': phrase('استبيان CapyBrain'),
  'Our urban wellbeing survey is designed with privacy at its core:': phrase(
    'صُمّم استبيان جودة الحياة الحضرية لدينا لتكون الخصوصية في صميمه:',
    'استبيان جودة الحياة في المدن عندنا متصمم بحيث الخصوصية تكون في أساسه:'
  ),
  'All responses are completely anonymous': phrase(
    'جميع الإجابات مجهولة الهوية تمامًا',
    'كل الإجابات مجهولة الهوية تمامًا'
  ),
  'No email addresses or personal identifiers are collected': phrase(
    'لا تُجمع عناوين بريد إلكتروني أو معرّفات شخصية',
    'مش بنجمع عناوين بريد إلكتروني أو معرّفات شخصية'
  ),
  'Location data is aggregated to neighborhood level only': phrase(
    'تُجمّع بيانات الموقع على مستوى الحي فقط',
    'بيانات الموقع بتتجمّع على مستوى الحي بس'
  ),
  'Responses cannot be traced back to individual participants': phrase(
    'لا يمكن ربط الإجابات بالمشاركين الأفراد',
    'ماينفعش تتربط الإجابات بأي مشارك بعينه'
  ),
  'Voluntary Communications': phrase(
    'التواصل الطوعي',
    'المعلومات اللي بتشاركها لما تتواصل معانا'
  ),
  'When you contact us directly via email or other means, we collect:': phrase(
    'عندما تتواصل معنا مباشرة بالبريد الإلكتروني أو بوسيلة أخرى، نجمع:',
    'لما تتواصل معانا مباشرة بالإيميل أو بأي وسيلة تانية، بنجمع:'
  ),
  'Name and email address': phrase('الاسم وعنوان البريد الإلكتروني'),
  'Message content': phrase('محتوى الرسالة'),
  'Any other information you choose to provide': phrase(
    'أي معلومات أخرى تختار تقديمها',
    'أي معلومات تانية بتختار تشاركها'
  ),
  'We use collected information to:': phrase(
    'نستخدم المعلومات التي نجمعها من أجل:',
    'بنستخدم المعلومات اللي بنجمعها عشان:'
  ),
  'Improve our platforms:': phrase('تحسين منصاتنا:'),
  'Understand how users interact with our websites and identify areas for improvement':
    phrase(
      'فهم كيفية تفاعل المستخدمين مع مواقعنا وتحديد مجالات التحسين',
      'نفهم إزاي الناس بتتفاعل مع مواقعنا ونحدد إيه اللي محتاج يتحسّن'
    ),
  'Advance urban research:': phrase('تطوير البحوث الحضرية:'),
  'Analyze aggregated environmental and survey data to identify patterns that affect urban wellbeing':
    phrase(
      'تحليل البيانات البيئية وبيانات الاستبيانات المجمّعة لتحديد الأنماط التي تؤثر في جودة الحياة الحضرية',
      'نحلل البيانات البيئية وبيانات الاستبيانات المجمّعة عشان نحدد الأنماط اللي بتأثر على جودة الحياة في المدن'
    ),
  'Provide open data:': phrase('إتاحة البيانات المفتوحة:'),
  'Share anonymized environmental data with researchers, policymakers, and the public':
    phrase(
      'مشاركة البيانات البيئية المنزوعة الهوية مع الباحثين وصانعي السياسات والجمهور',
      'نشارك البيانات البيئية المنزوعة الهوية مع الباحثين وصنّاع القرار والناس'
    ),
  'Respond to inquiries:': phrase('الرد على الاستفسارات:'),
  'Answer your questions and provide support': phrase(
    'الإجابة عن أسئلتك وتقديم الدعم',
    'نجاوب على أسئلتك ونقدّم الدعم'
  ),
  'Ensure security:': phrase('ضمان الأمان:'),
  'Protect our platforms from abuse and maintain system integrity': phrase(
    'حماية منصاتنا من إساءة الاستخدام والحفاظ على سلامة الأنظمة',
    'نحمي منصاتنا من إساءة الاستخدام ونحافظ على سلامة الأنظمة'
  ),
  'Our Approach': phrase('نهجنا', 'طريقتنا'),
  'We take a privacy-first approach to analytics. By default, we operate in cookieless mode, which means:':
    phrase(
      'نضع الخصوصية أولًا في التحليلات. ونعمل افتراضيًا دون ملفات تعريف ارتباط، مما يعني:',
      'بنحط الخصوصية في الأول في التحليلات. وبنشتغل افتراضيًا من غير ملفات تعريف ارتباط، وده معناه:'
    ),
  'No cookies are set until you give consent': phrase(
    'لا تُخزّن ملفات تعريف الارتباط قبل موافقتك',
    'مش بيتخزن أي ملف تعريف ارتباط قبل موافقتك'
  ),
  'Anonymous tracking provides basic insights without identifying you': phrase(
    'يوفّر التتبع المجهول الهوية معلومات أساسية دون التعرّف عليك',
    'التتبّع المجهول الهوية بيوفر معلومات أساسية من غير ما يحدد هويتك'
  ),
  'Your choice is remembered and respected': phrase(
    'يُحفظ اختيارك ويُحترم',
    'بنحفظ اختيارك وبنحترمه'
  ),
  'Types of Cookies We Use': phrase(
    'أنواع ملفات تعريف الارتباط التي نستخدمها',
    'أنواع ملفات تعريف الارتباط اللي بنستخدمها'
  ),
  'Required for basic website functionality. These cannot be disabled and do not track personal information.':
    phrase(
      'ضرورية للوظائف الأساسية للموقع. لا يمكن تعطيلها، ولا تتتبّع معلومات شخصية.',
      'ضرورية للوظائف الأساسية للموقع. مينفعش تتوقف، ومش بتتبع معلومات شخصية.'
    ),
  'Help us understand visitor interactions through PostHog and Google Analytics. Only active with your consent.':
    phrase(
      'تساعدنا على فهم تفاعلات الزوار عبر PostHog وGoogle Analytics، ولا تُفعّل إلا بموافقتك.',
      'بتساعدنا نفهم تفاعل الزوار عن طريق PostHog وGoogle Analytics، ومش بتشتغل إلا بموافقتك.'
    ),
  'Managing Cookies': phrase('إدارة ملفات تعريف الارتباط'),
  'You can manage your cookie preferences at any time through the cookie banner on our website. You can also control cookies through your browser settings.':
    phrase(
      'يمكنك إدارة تفضيلات ملفات تعريف الارتباط في أي وقت عبر شريط ملفات تعريف الارتباط على موقعنا. ويمكنك أيضًا التحكم فيها من إعدادات المتصفح.',
      'تقدر تغيّر اختيارات ملفات تعريف الارتباط في أي وقت من الشريط الخاص بيها على موقعنا. وتقدر تتحكم فيها كمان من إعدادات المتصفح.'
    ),
  'We do not sell your personal information. We may share information in the following circumstances:':
    phrase(
      'لا نبيع معلوماتك الشخصية. وقد نشارك المعلومات في الحالات الآتية:',
      'إحنا مش بنبيع معلوماتك الشخصية. وممكن نشارك معلومات في الحالات دي:'
    ),
  'Service providers:': phrase('مقدّمو الخدمات:'),
  'We use trusted third parties for analytics (PostHog, Google Analytics) and infrastructure services':
    phrase(
      'نستخدم جهات خارجية موثوقة للتحليلات (PostHog وGoogle Analytics) وخدمات البنية التحتية',
      'بنستخدم جهات خارجية موثوقة للتحليلات (PostHog وGoogle Analytics) وخدمات البنية التحتية'
    ),
  'Open data initiatives:': phrase('مبادرات البيانات المفتوحة:'),
  'Environmental sensor data is shared publicly through': phrase(
    'تُشارك بيانات المستشعرات البيئية مع الجمهور عبر',
    'بيانات المستشعرات البيئية بتتشارك بشكل عام عن طريق'
  ),
  'in anonymized, aggregated formats': phrase(
    'بصيغ مجمّعة ومنزوعة الهوية',
    'بصيغ مجمّعة ومنزوعة الهوية'
  ),
  'Legal requirements:': phrase('المتطلبات القانونية:'),
  'When required by law or to protect our rights and safety': phrase(
    'عندما يقتضي القانون ذلك أو لحماية حقوقنا وسلامتنا',
    'لما القانون يطلب ده أو لحماية حقوقنا وسلامتنا'
  ),
  'Research collaborations:': phrase('التعاون البحثي:'),
  'Anonymized, aggregated data may be shared with academic and research partners':
    phrase(
      'قد تُشارك بيانات مجمّعة ومنزوعة الهوية مع شركاء أكاديميين وبحثيين',
      'ممكن نشارك بيانات مجمّعة ومنزوعة الهوية مع شركاء أكاديميين وبحثيين'
    ),
  'We believe in the power of open data to improve urban life. Our commitment includes:':
    phrase(
      'نؤمن بقدرة البيانات المفتوحة على تحسين الحياة في المدن. ويشمل التزامنا:',
      'بنؤمن إن البيانات المفتوحة تقدر تحسّن الحياة في المدن. والتزامنا بيشمل:'
    ),
  'Transparency:': phrase('الشفافية:'),
  'Environmental data from OpenSensor.Space is publicly available in open Parquet format under the':
    phrase(
      'البيانات البيئية من OpenSensor.Space متاحة للجمهور بصيغة Parquet المفتوحة بموجب',
      'البيانات البيئية من OpenSensor.Space متاحة للكل بصيغة Parquet المفتوحة بموجب'
    ),
  'Creative Commons Attribution 4.0 International (CC BY 4.0)': phrase(
    'المشاع الإبداعي نَسب المُصنَّف 4.0 دولي (CC BY 4.0)'
  ),
  license: phrase('— ترخيص الاستخدام'),
  'Anonymization:': phrase('نزع الهوية:'),
  'All shared data is thoroughly anonymized to prevent identification of individuals':
    phrase(
      'تُنزع الهوية من جميع البيانات المشتركة بعناية لمنع التعرّف على الأفراد',
      'بننزع الهوية بعناية من كل البيانات اللي بنشاركها عشان نمنع التعرّف على الأفراد'
    ),
  'Community benefit:': phrase('منفعة المجتمع:'),
  'Data is shared to support research, urban planning, and community decision-making':
    phrase(
      'تُشارك البيانات لدعم البحث والتخطيط الحضري واتخاذ القرارات المجتمعية',
      'بنشارك البيانات عشان ندعم البحث والتخطيط العمراني واتخاذ القرارات في المجتمع'
    ),
  'Ethical use:': phrase('الاستخدام الأخلاقي:'),
  'We encourage responsible use of our open data for positive social impact':
    phrase(
      'نشجّع الاستخدام المسؤول لبياناتنا المفتوحة لتحقيق أثر اجتماعي إيجابي',
      'بنشجّع الاستخدام المسؤول لبياناتنا المفتوحة عشان يكون ليها أثر إيجابي على المجتمع'
    ),
  'Depending on your location, you may have the following rights regarding your personal information:':
    phrase(
      'بحسب موقعك، قد تكون لك الحقوق الآتية المتعلقة بمعلوماتك الشخصية:',
      'حسب مكانك، ممكن يكون ليك الحقوق دي بخصوص معلوماتك الشخصية:'
    ),
  'Access:': phrase('الوصول:'),
  'Request a copy of the personal information we hold about you': phrase(
    'طلب نسخة من المعلومات الشخصية التي نحتفظ بها عنك',
    'تطلب نسخة من المعلومات الشخصية اللي محتفظين بيها عنك'
  ),
  'Correction:': phrase('التصحيح:'),
  'Request correction of inaccurate personal information': phrase(
    'طلب تصحيح المعلومات الشخصية غير الدقيقة',
    'تطلب تصحيح معلوماتك الشخصية غير الدقيقة'
  ),
  'Deletion:': phrase('الحذف:'),
  'Request deletion of your personal information': phrase(
    'طلب حذف معلوماتك الشخصية',
    'تطلب حذف معلوماتك الشخصية'
  ),
  'Portability:': phrase('نقل البيانات:'),
  'Request transfer of your data in a machine-readable format': phrase(
    'طلب نقل بياناتك بصيغة قابلة للقراءة آليًا',
    'تطلب نقل بياناتك بصيغة يقدر الكمبيوتر يقراها'
  ),
  'Opt-out:': phrase('سحب الموافقة:'),
  'Withdraw consent for analytics tracking at any time': phrase(
    'سحب الموافقة على التتبع التحليلي في أي وقت',
    'تسحب موافقتك على التتبّع التحليلي في أي وقت'
  ),
  'Objection:': phrase('الاعتراض:'),
  'Object to processing of your personal information': phrase(
    'الاعتراض على معالجة معلوماتك الشخصية',
    'تعترض على معالجة معلوماتك الشخصية'
  ),
  'To exercise these rights, please contact us at': phrase(
    'لممارسة هذه الحقوق، يرجى التواصل معنا على',
    'عشان تمارس الحقوق دي، تواصل معانا على'
  ),
  'We implement appropriate technical and organizational measures to protect your information:':
    phrase(
      'نطبّق تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك:',
      'بنطبّق إجراءات تقنية وتنظيمية مناسبة عشان نحمي معلوماتك:'
    ),
  'HTTPS encryption for all data transmission': phrase(
    'تشفير HTTPS لجميع عمليات نقل البيانات',
    'تشفير HTTPS لكل عمليات نقل البيانات'
  ),
  'Secure cloud infrastructure with access controls': phrase(
    'بنية تحتية سحابية آمنة مع ضوابط للوصول'
  ),
  'Regular security assessments and updates': phrase(
    'تقييمات وتحديثات أمنية منتظمة'
  ),
  'Minimal data collection practices': phrase(
    'ممارسات تقلّل جمع البيانات إلى الحد الأدنى',
    'ممارسات بتقلّل جمع البيانات لأقل قدر ممكن'
  ),
  'Data anonymization where possible': phrase(
    'نزع هوية البيانات حيثما أمكن',
    'نزع هوية البيانات كل ما يكون ده ممكن'
  ),
  'While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but are committed to implementing industry best practices.':
    phrase(
      'نسعى إلى حماية معلوماتك، لكن لا توجد وسيلة نقل عبر الإنترنت آمنة بنسبة 100%. لا نستطيع ضمان الأمان المطلق، ولكننا نلتزم بتطبيق أفضل الممارسات في المجال.',
      'بنسعى لحماية معلوماتك، لكن مفيش وسيلة نقل على الإنترنت آمنة بنسبة 100%. مش بنقدر نضمن الأمان المطلق، لكن ملتزمين بتطبيق أفضل الممارسات في المجال.'
    ),
  'Our platforms are not directed at children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.':
    phrase(
      'منصاتنا غير موجّهة للأطفال دون سن 13 عامًا. ولا نجمع عمدًا معلومات شخصية من الأطفال. إذا اعتقدت أننا جمعنا دون قصد معلومات من طفل، فيرجى التواصل معنا فورًا.',
      'منصاتنا مش موجّهة للأطفال أقل من 13 سنة. ومش بنجمع عن قصد معلومات شخصية من الأطفال. لو تعتقد إننا جمعنا معلومات من طفل من غير قصد، تواصل معانا فورًا.'
    ),
  'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the “Last updated” date. We encourage you to review this Privacy Policy periodically.':
    phrase(
      'قد نحدّث سياسة الخصوصية من حين لآخر. وسنُعلمك بأي تغييرات جوهرية بنشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ «آخر تحديث». ونشجّعك على مراجعة هذه السياسة دوريًا.',
      'ممكن نحدّث سياسة الخصوصية من وقت للتاني. وهنبلغك بأي تغييرات جوهرية بنشر السياسة الجديدة على الصفحة دي وتحديث تاريخ «آخر تحديث». وبنشجّعك تراجع السياسة دي من وقت للتاني.'
    ),
  'Continued use of our platforms after any changes constitutes acceptance of the updated Privacy Policy.':
    phrase(
      'يُعد استمرار استخدام منصاتنا بعد أي تغييرات قبولًا لسياسة الخصوصية المحدّثة.',
      'استمرار استخدام منصاتنا بعد أي تغييرات بيُعتبر قبول لسياسة الخصوصية المحدّثة.'
    ),
  'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:':
    phrase(
      'إذا كانت لديك أسئلة أو مخاوف أو طلبات تتعلق بسياسة الخصوصية هذه أو ممارساتنا في التعامل مع البيانات، فيرجى التواصل معنا:',
      'لو عندك أسئلة أو مخاوف أو طلبات بخصوص سياسة الخصوصية دي أو تعاملنا مع البيانات، تواصل معانا:'
    ),
  'Email:': phrase('البريد الإلكتروني:', 'الإيميل:'),
  'Website:': phrase('الموقع الإلكتروني:', 'الموقع:'),
  'We aim to respond to all inquiries within 30 days.': phrase(
    'نهدف إلى الرد على جميع الاستفسارات خلال 30 يومًا.',
    'بنهدف للرد على كل الاستفسارات خلال 30 يوم.'
  ),
};

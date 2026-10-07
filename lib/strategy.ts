import type { PaletteId } from './brand';

/** Organization copy shared by the homepage and About page. */
export const vision =
  'Every place understood through the people who experience it and shaped by the evidence they generate.';

export const mission =
  'We make the invisible relationships between people and places measurable through open tools, turning everyday experience into evidence for better decisions.';

export const strategicGoals = [
  {
    id: 'open-ecosystem',
    palette: 'ecosystem' satisfies PaletteId,
    label: 'Open ecosystem',
    motif: 'blocks',
    title: 'Build an open ecosystem',
    summary: 'Open tools and portable infrastructure.',
    href: '/software',
    link: 'Explore our open tools',
    details: [
      {
        title: 'Serverless & edge computing',
        body: 'Browser-native tools run on your device, using WebAssembly and DuckDB-WASM where appropriate.',
      },
      {
        title: 'Lean infrastructure',
        body: 'Static hosting and on-demand computation keep infrastructure lean.',
      },
      {
        title: 'Privacy-first design',
        body: 'No forced accounts. Participatory research is designed around on-device data and no personal movement histories.',
      },
      {
        title: 'Open by design',
        body: 'Open code and data in GeoParquet, STAC, COG, PMTiles and H3. Published on Source Cooperative, with licenses recorded per source.',
      },
      {
        title: 'Independent infrastructure',
        body: 'Open protocols and object storage keep tools and data portable across providers.',
      },
    ],
  },
  {
    id: 'measurable-places',
    palette: 'sensing' satisfies PaletteId,
    label: 'Measurable places',
    motif: 'radio',
    title: 'Make places measurable',
    summary: 'Local sensing of environmental conditions.',
    href: '/opensensor',
    link: 'Meet OpenSensor.Space',
    details: [
      {
        title: 'OpenSensor.Space · live',
        body: 'Low-cost, open-source sensors sharing environmental readings publicly.',
      },
      {
        title: 'Hyper-local air quality',
        body: 'We design, calibrate and deploy PM2.5 and PM10 sensors in Cairo to fill neighbourhood measurement gaps.',
      },
      {
        title: 'Noise & lighting · next',
        body: 'Next: measure noise and artificial light exposure.',
      },
    ],
  },
  {
    id: 'measurable-experience',
    palette: 'experience' satisfies PaletteId,
    label: 'Lived experience',
    motif: 'brain',
    title: 'Make lived experience measurable',
    summary: 'Understand how people experience their surroundings.',
    href: '/capybrain',
    link: 'Explore our wellbeing research',
    details: [
      {
        title: 'Geobrain',
        body: 'A framework connecting urban surroundings with human wellbeing.',
      },
      {
        title: 'TRIBE v2 · experimental',
        body: 'An experimental London street-imagery demo of predicted brain responses using Meta’s TRIBE v2 model.',
      },
      {
        title: 'Participatory mapping · in development',
        body: 'Anonymous neighbourhood wellbeing signals from phones, designed around local data and safeguards for young people. Methods are in development.',
      },
    ],
  },
  {
    id: 'spatial-intelligence',
    palette: 'spatial' satisfies PaletteId,
    label: 'Spatial intelligence',
    motif: 'globe',
    title: 'Turn diverse data into spatial intelligence',
    summary: 'Combine environmental and urban datasets.',
    href: '/indices',
    link: 'Explore Earth’s Living Indices',
    details: [
      {
        title: 'Globe Explorer',
        body: 'Terrain, population, buildings and weather on one H3 grid, explored in your browser.',
      },
      {
        title: 'Automated data pipelines',
        body: 'GitHub Actions processes and publishes spatial data to object storage, without an always-on database.',
      },
      {
        title: 'Cloud-native execution',
        body: 'Open Parquet outputs support selective reads and reuse in SQL tools such as DuckDB.',
      },
    ],
  },
  {
    id: 'real-decisions',
    palette: 'action' satisfies PaletteId,
    label: 'Real decisions',
    motif: 'scale',
    title: 'Put evidence into real decisions',
    summary: 'Inform health, climate and community decisions.',
    href: 'mailto:hi@walkthru.earth',
    link: 'Build an evidence partnership',
    details: [
      {
        title: 'Policy advocacy for health & climate',
        body: 'Turn environmental observations into policy briefs for teams working on air pollution and urban heat.',
      },
      {
        title: 'Climate justice in practice',
        body: 'Help communities use verifiable evidence to advocate for cleaner air, green space and fairer protection.',
      },
    ],
  },
] as const;

export const changeSteps = [
  {
    title: 'Evidence',
    subtitle: 'Make the invisible visible',
    body: 'Bring together sensor readings, spatial data and lived experience.',
    output: 'Observations, maps & community signals',
  },
  {
    title: 'Translation',
    subtitle: 'Make the evidence meaningful',
    body: 'Explain findings through clear maps, local context and policy briefs.',
    output: 'Shared understanding & decision-ready insights',
  },
  {
    title: 'Action',
    subtitle: 'Make understanding matter',
    body: 'Use the evidence in community priorities and public decisions, then measure what changes.',
    output: 'Local priorities, informed decisions & learning',
  },
] as const;

export const policyFrameworks = [
  {
    badge: 'UN · 76/300',
    title: 'Right to a healthy environment',
    body: 'Environmental information, public participation and climate justice.',
    href: 'https://digitallibrary.un.org/record/3983329?ln=en',
  },
  {
    badge: 'WHO · 2021',
    title: 'Global Air Quality Guidelines',
    body: 'Health-based guidance for interpreting PM2.5 and PM10 observations.',
    href: 'https://www.who.int/publications/i/item/9789240034228',
  },
  {
    badge: 'EGYPT · 2050',
    title: 'National Climate Change Strategy',
    body: 'Local climate-risk monitoring and low-emission development.',
    href: 'https://www.eeaa.gov.eg/Uploads/Topics/Files/20221206130720583.pdf',
  },
  {
    badge: 'WORLD BANK · CAIRO',
    title: 'Greater Cairo air pollution & climate action',
    body: 'Neighbourhood evidence supporting cleaner air in Greater Cairo.',
    href: 'https://www.worldbank.org/en/news/press-release/2020/09/30/new-project-to-support-the-improvement-of-air-quality-and-the-fight-against-climate-change-in-greater-cairo',
  },
  {
    badge: 'UNEP',
    title: 'Air quality monitoring & assessment',
    body: 'Accessible air-quality information and continuous monitoring.',
    href: 'https://www.unep.org/topics/air/monitoring-and-assessments',
  },
  {
    badge: 'IPCC · AR6',
    title: 'Health & climate co-benefits',
    body: 'Health benefits from cleaner transport, green space and climate action.',
    href: 'https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/',
  },
  {
    badge: 'EGYPT · 4/1994',
    title: 'Environment Law, as amended',
    body: 'Community observations alongside official environmental monitoring.',
    href: 'https://www.eeaa.gov.eg/Laws/55/index',
  },
  {
    badge: 'SDGs · 3 / 10 / 11 / 13',
    title: 'Sustainable Development Goals',
    body: 'Health, equality, sustainable cities and climate action.',
    href: 'https://sdgs.un.org/goals',
  },
] as const;

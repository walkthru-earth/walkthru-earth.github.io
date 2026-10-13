/** Shared public contact details for About and the founder Links profiles. */
export const founders = [
  {
    id: 'youssef',
    name: 'Youssef Harby',
    role: 'CTO / Co-Founder',
    image: '/youssef-harby.jpg',
    alt: 'Youssef Harby',
    linkedin: 'https://www.linkedin.com/in/yharby/',
    linkedinLabel: 'Youssef Harby on LinkedIn',
    email: 'yharby@walkthru.earth',
    emailLabel: 'Email Youssef Harby',
    whatsappGreeting: 'Hello Youssef!',
  },
  {
    id: 'mishka',
    name: 'Mishka Mendbayar',
    role: 'CEO / Co-Founder',
    image: '/mishka-mendbayar.jpg',
    alt: 'Myagmarjargal Mendbayar (Mishka)',
    linkedin: 'https://www.linkedin.com/in/myagmarjargal-mendbayar001/',
    linkedinLabel: 'Mishka Mendbayar on LinkedIn',
    email: 'mishka@walkthru.earth',
    emailLabel: 'Email Mishka Mendbayar',
    whatsappGreeting: 'Hello Mishka!',
  },
] as const;

export const businessWhatsApp = {
  handle: '@walkthru.earth',
  url: 'https://wa.me/walkthru.earth',
} as const;

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://thedreamydelights.com',
  generateRobotsTxt: true,
  sitemapSize: 7000, // optional
  changefreq: 'daily',
  priority: 0.7,
  trailingSlash: false,
  outDir: './out',
  exclude: [
    '/admin',
    '/admin/', 
    '/admin/*', 
    '/admin/**', 
    '/admin/dashboard', 
    '/admin/debug', 
    '/admin/test', 
    '/admin/login',
    '/auth/register', 
    '/auth/test', 
    '/checkout', 
    '/cart'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://thedreamydelights.com/sitemap.xml',
    ],
  },
  additionalPaths: async (config) => {
    return [
      {
        loc: '/',
        priority: 1.0,
        changefreq: 'daily',
      },
      {
        loc: '/menu',
        priority: 0.9,
        changefreq: 'daily',
      },
      {
        loc: '/about',
        priority: 0.8,
        changefreq: 'monthly',
      },
      {
        loc: '/contact',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        loc: '/auth/login',
        priority: 0.4,
        changefreq: 'monthly',
      },
    ];
  },
};

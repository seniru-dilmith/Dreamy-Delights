/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://thedreamydelights.com',
  generateRobotsTxt: true,
  sitemapSize: 7000, // optional
  changefreq: 'daily',
  priority: 0.7,
  trailingSlash: false,
  exclude: ['/admin'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
};

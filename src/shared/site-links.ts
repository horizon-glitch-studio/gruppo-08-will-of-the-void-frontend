/** A link of the static site navigation. */
export interface SiteLink {
  href: string
  label: string
}

/**
 * Links of the static site, in menu order. Single source for both menus:
 * the static pages get them at build time (vite.config.ts, partial "site-links"),
 * the /play side menu imports them.
 */
export const siteLinks: readonly SiteLink[] = [
  { href: '/', label: 'Home' },
  { href: '/lore/', label: 'Lore' },
  { href: '/rulebook/', label: 'Rulebook' },
  { href: '/support/', label: 'Support' },
  { href: '/about/', label: 'About' },
]

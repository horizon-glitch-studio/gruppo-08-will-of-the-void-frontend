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
  { href: '/card-prototype/', label: 'Cards' },
  { href: '/lore/', label: 'Lore' },
  { href: '/rulebook/', label: 'Rulebook' },
  { href: '/rulebook/glossary/', label: 'Glossary' },
  { href: '/about/', label: 'About' },
  { href: '/support/', label: 'Support' },
  { href: '/admin/', label: 'Admin' },
  { href: '/play/', label: 'Play' },
  { href: '/404', label: '404' },
]

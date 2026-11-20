import { Drawer } from '@/shared/components/Drawer'
import { siteLinks } from '@/shared/site-links'

/** Id of the site menu drawer, for the button that opens it. */
export const SITE_MENU_ID = 'site-menu'

/** Left drawer with the static site links. They leave the game, so they are plain anchors. */
export function SiteMenu() {
  return (
    <Drawer id={SITE_MENU_ID} title="Will of the Void">
      <nav aria-label="Site">
        <ul className="list-plain column gap-xs">
          {siteLinks.map(({ href, label }) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  )
}

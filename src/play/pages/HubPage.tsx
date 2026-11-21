import { RocketLaunchIcon, ShoppingCartSimpleIcon } from '@phosphor-icons/react'
import { ButtonLink } from '@/shared/components/Button'
import { Starfield } from '../components/hub/Starfield'
import { VoidLink } from '../components/hub/VoidLink'
import { paths } from '../routes/paths'
import styles from './HubPage.module.css'

/** Home screen: the Void leads to the Arena, the two buttons to Shop and Ship. */
export function HubPage() {
  return (
    <>
      {/* Outside the hub: its container query would trap the fixed background inside it */}
      <Starfield />
      <div className={styles.hub}>
        <div className={styles.layout}>
          <ButtonLink to={paths.shop} tone="shop" size="lg" icon={<ShoppingCartSimpleIcon size={28} weight="bold" />} className={styles.shop}>
            Shop
          </ButtonLink>
          <div className={styles.center}>
            <VoidLink />
          </div>
          <ButtonLink to={paths.ship} tone="ship" size="lg" icon={<RocketLaunchIcon size={28} weight="bold" />} className={styles.ship}>
            Ship
          </ButtonLink>
        </div>
      </div>
    </>
  )
}

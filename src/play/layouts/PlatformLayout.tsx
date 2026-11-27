import { Outlet } from 'react-router'
import { BonusNotice } from '../components/BonusNotice'
import { BottomNav } from '../components/BottomNav'
import { PageHeader } from '../components/PageHeader'
import { PreferencesSync } from '../components/PreferencesSync'
import { TopBar } from '../components/TopBar'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './PlatformLayout.module.css'

/**
 * Layout of the logged-in platform: top bar, Shard bonus notice, page header, content and bottom navigation.
 * Title and back link come from the route handle (routes/meta.ts). The hub has neither header nor bottom navigation; immersive screens (the story) have a minimal top bar, their own links and no bottom navigation.
 */
export function PlatformLayout() {
  const { meta, back } = usePageMeta()
  const isHub = meta?.isHub ?? false

  return (
    <div className={styles.layout}>
      <PreferencesSync />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopBar minimal={meta?.immersive} />
      <BonusNotice hidden={meta?.immersive ?? false} />
      <main id="main" className={`container column gap-m ${styles.main}`} data-hub={isHub || undefined} data-immersive={meta?.immersive || undefined}>
        {meta && <PageHeader title={meta.title} back={meta.immersive ? undefined : back} hideTitle={isHub || meta.immersive} />}
        <Outlet />
      </main>
      {!isHub && !meta?.immersive && <BottomNav />}
    </div>
  )
}

import { Outlet } from 'react-router'
import { BottomNav } from '../components/BottomNav'
import { PageHeader } from '../components/PageHeader'
import { TopBar } from '../components/TopBar'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './PlatformLayout.module.css'

/**
 * Layout of the logged-in platform: top bar, page header, content and bottom navigation.
 * Title and back link come from the route handle (routes/meta.ts). The hub has neither header nor bottom navigation.
 */
export function PlatformLayout() {
  const { meta, back } = usePageMeta()
  const isHub = meta?.isHub ?? false

  return (
    <div className={styles.layout}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopBar />
      <main id="main" className={`container column gap-m ${styles.main}`} data-hub={isHub || undefined}>
        {meta && <PageHeader title={meta.title} back={back} hideTitle={isHub} />}
        <Outlet />
      </main>
      {!isHub && <BottomNav />}
    </div>
  )
}

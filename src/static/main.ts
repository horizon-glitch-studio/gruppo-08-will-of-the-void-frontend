/** Entry of the static pages: shared styles, then the styles of the site frame (header, menu, footer, page). */
import '@/styles/index.css'
import './site.css'
import { setupConsent } from './consent'

/** Back to top: shown once the page has scrolled past one screen. Without JavaScript it stays hidden. */
const toTop = document.querySelector<HTMLElement>('.to-top')
if (toTop) {
  const update = () => (toTop.hidden = window.scrollY < window.innerHeight)
  window.addEventListener('scroll', update, { passive: true })
  update()
}

setupConsent()

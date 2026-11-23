/**
 * Cookie consent and Google Tag Manager, with Google consent mode.
 * Before anything else, every optional storage is denied. GTM loads only if VITE_GTM_ID is set; analytics turn on only after Accept (or Choose with Analytics on).
 * The choice is saved on this device and asked again after 6 months. Cookie Settings in the footer opens the settings at any time.
 */

type Choice = { analytics: boolean; date: string }

const storageKey = 'wotv.cookieConsent'
const askAgainAfter = 1000 * 60 * 60 * 24 * 182 // about 6 months
const gtmId = import.meta.env.VITE_GTM_ID?.trim()

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

window.dataLayer = window.dataLayer ?? []
// gtag() as Google defines it: it pushes its own arguments object, not an array
function gtag(..._args: unknown[]) {
  window.dataLayer.push(arguments)
}

gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500,
})

function readChoice(): Choice | null {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Choice | null
    if (!saved || Date.now() - Date.parse(saved.date) > askAgainAfter) return null
    return saved
  } catch {
    return null
  }
}

function apply(choice: Choice) {
  gtag('consent', 'update', { analytics_storage: choice.analytics ? 'granted' : 'denied' })
}

function save(analytics: boolean) {
  const choice = { analytics, date: new Date().toISOString() }
  try {
    localStorage.setItem(storageKey, JSON.stringify(choice))
  } catch {
    // Storage blocked: the choice lasts for this page only, and the banner comes back next time
  }
  apply(choice)
}

function loadTagManager() {
  if (!gtmId) return
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  document.head.append(script)
}

/** Applies the saved choice, loads GTM and wires the banner, the settings dialog and the Cookie Settings links. */
export function setupConsent() {
  const banner = document.querySelector<HTMLElement>('.cookie-banner')
  const dialog = document.querySelector<HTMLDialogElement>('.cookie-dialog')
  const analyticsSwitch = dialog?.querySelector<HTMLInputElement>('input[name="analytics"]')

  const saved = readChoice()
  if (saved) apply(saved)
  loadTagManager()

  if (banner && dialog && analyticsSwitch) {
    banner.hidden = saved !== null
    for (const settings of document.querySelectorAll<HTMLElement>('.link-button[data-consent="choose"]')) settings.hidden = false

    document.addEventListener('click', (event) => {
      const button = (event.target as Element).closest<HTMLElement>('[data-consent]')
      if (!button) return
      const action = button.dataset.consent
      if (action === 'accept' || action === 'reject') {
        save(action === 'accept')
        banner.hidden = true
      }
      if (action === 'choose') {
        analyticsSwitch.checked = readChoice()?.analytics ?? false
        dialog.showModal()
      }
    })

    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'save') return
      save(analyticsSwitch.checked)
      banner.hidden = true
    })
  }
}

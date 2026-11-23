import type { Params } from 'react-router'
import { paths } from './paths'

/** Title and position of a /play screen. Set on each route as `handle`, read by usePageMeta. */
export interface PageMeta {
  /** Page heading and browser tab title. */
  title: string
  /** Path of the screen, needed only when another screen goes back to it. Dynamic paths read the current route params. */
  path?: string | ((params: Params) => string)
  /** Screen that "back" leads to: always the same, wherever the player came from. */
  parent?: PageMeta
  /** The hub: no visible heading, no back link, no bottom navigation. */
  isHub?: boolean
  /** Full-screen content (the story): minimal top bar, no visible heading or back link (the page has its own) and no bottom navigation, to leave the height to the content. */
  immersive?: boolean
}

const hub: PageMeta = { title: 'Hub', path: paths.hub, isHub: true }

const shop: PageMeta = { title: 'Shop', path: paths.shop, parent: hub }
const collection: PageMeta = { title: 'Collection', path: paths.collection, parent: hub }
const decks: PageMeta = { title: 'Decks', path: paths.decks, parent: hub }
const trades: PageMeta = { title: 'Trades', path: paths.trades, parent: hub }
const arena: PageMeta = { title: 'Arena', path: paths.arena, parent: hub }
const battle: PageMeta = { title: 'Battle', path: (params) => paths.battle(params.battleId ?? ''), parent: arena }
const profile: PageMeta = { title: 'Profile', path: paths.profile, parent: hub }
const community: PageMeta = { title: 'Community', path: paths.community, parent: hub }

/** Every screen of the platform, in the order of the router. */
export const meta = {
  hub,
  shop,
  packOpening: { title: 'Pack opening', parent: shop },
  shopHistory: { title: 'History', parent: shop },
  collection,
  collectionCard: { title: 'Card', parent: collection },
  decks,
  deckNew: { title: 'New deck', parent: decks },
  deckEditor: { title: 'Deck editor', parent: decks },
  trades,
  tradeNew: { title: 'New trade', parent: trades },
  trade: { title: 'Trade', parent: trades },
  arena,
  arenaQuick: { title: 'Quick match', parent: arena },
  arenaRanked: { title: 'Ranked match', parent: arena },
  arenaFriend: { title: 'Friend match', parent: arena },
  challenges: { title: 'Challenges', parent: arena },
  battle,
  replay: { title: 'Replay', parent: battle },
  battleHistory: { title: 'Battle history', parent: arena },
  leaderboard: { title: 'Leaderboard', parent: arena },
  profile,
  friends: { title: 'Friends', parent: profile },
  community,
  summoner: { title: 'Summoner', parent: community },
  settings: { title: 'Settings', parent: hub },
  story: { title: 'Story', parent: hub, immersive: true },
  tutorial: { title: 'Tutorial', path: paths.tutorial, parent: hub },
  notFound: { title: 'Page not found', parent: hub },
} satisfies Record<string, PageMeta>

import { createBrowserRouter, Navigate } from 'react-router'
import { AuthLayout } from '../layouts/AuthLayout'
import { PlatformLayout } from '../layouts/PlatformLayout'
import { RequireAuth } from '../layouts/RequireAuth'
import { ArenaBattlePage } from '../pages/ArenaBattlePage'
import { ArenaChallengesPage } from '../pages/ArenaChallengesPage'
import { ArenaFriendPage } from '../pages/ArenaFriendPage'
import { ArenaHistoryPage } from '../pages/ArenaHistoryPage'
import { ArenaLeaderboardPage } from '../pages/ArenaLeaderboardPage'
import { ArenaPage } from '../pages/ArenaPage'
import { ArenaQuickPage } from '../pages/ArenaQuickPage'
import { ArenaRankedPage } from '../pages/ArenaRankedPage'
import { ArenaReplayPage } from '../pages/ArenaReplayPage'
import { AuthForgotPasswordPage } from '../pages/AuthForgotPasswordPage'
import { AuthLoginPage } from '../pages/AuthLoginPage'
import { AuthRegisterPage } from '../pages/AuthRegisterPage'
import { AuthResetPasswordPage } from '../pages/AuthResetPasswordPage'
import { AuthVerifyEmailPage } from '../pages/AuthVerifyEmailPage'
import { CommunityPage } from '../pages/CommunityPage'
import { CommunitySummonerPage } from '../pages/CommunitySummonerPage'
import { HubPage } from '../pages/HubPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProfileFriendsPage } from '../pages/ProfileFriendsPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { ShipCollectionCardPage } from '../pages/ShipCollectionCardPage'
import { ShipCollectionPage } from '../pages/ShipCollectionPage'
import { ShipDeckEditorPage } from '../pages/ShipDeckEditorPage'
import { ShipDecksPage } from '../pages/ShipDecksPage'
import { ShipTradeDetailPage } from '../pages/ShipTradeDetailPage'
import { ShipTradeNewPage } from '../pages/ShipTradeNewPage'
import { ShipTradesPage } from '../pages/ShipTradesPage'
import { ShopHistoryPage } from '../pages/ShopHistoryPage'
import { ShopPackOpeningPage } from '../pages/ShopPackOpeningPage'
import { ShopPage } from '../pages/ShopPage'
import { meta } from './meta'

/**
 * Router of the /play app. Paths are relative to the basename /play.
 * Each platform screen sets `handle` to its PageMeta: title, back link and hub flag come from there.
 */
export const router = createBrowserRouter(
  [
    {
      // Account access: reachable without a session.
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <AuthLoginPage /> },
        { path: 'register', element: <AuthRegisterPage /> },
        { path: 'forgot-password', element: <AuthForgotPasswordPage /> },
        { path: 'reset-password', element: <AuthResetPasswordPage /> },
        { path: 'verify-email', element: <AuthVerifyEmailPage /> },
      ],
    },
    {
      // Platform: needs a logged-in Summoner.
      element: <RequireAuth />,
      children: [
        {
          element: <PlatformLayout />,
          children: [
            { index: true, element: <HubPage />, handle: meta.hub },
            {
              path: 'shop',
              children: [
                { index: true, element: <ShopPage />, handle: meta.shop },
                { path: 'openings/:openingId', element: <ShopPackOpeningPage />, handle: meta.packOpening },
                { path: 'history', element: <ShopHistoryPage />, handle: meta.shopHistory },
              ],
            },
            {
              path: 'ship',
              children: [
                { index: true, element: <Navigate to="collection" replace /> },
                { path: 'collection', element: <ShipCollectionPage />, handle: meta.collection },
                { path: 'collection/:cardId', element: <ShipCollectionCardPage />, handle: meta.collectionCard },
                { path: 'decks', element: <ShipDecksPage />, handle: meta.decks },
                { path: 'decks/new', element: <ShipDeckEditorPage />, handle: meta.deckNew },
                { path: 'decks/:deckId', element: <ShipDeckEditorPage />, handle: meta.deckEditor },
                { path: 'trades', element: <ShipTradesPage />, handle: meta.trades },
                { path: 'trades/new', element: <ShipTradeNewPage />, handle: meta.tradeNew },
                { path: 'trades/:tradeId', element: <ShipTradeDetailPage />, handle: meta.trade },
              ],
            },
            {
              path: 'arena',
              children: [
                { index: true, element: <ArenaPage />, handle: meta.arena },
                { path: 'quick', element: <ArenaQuickPage />, handle: meta.arenaQuick },
                { path: 'ranked', element: <ArenaRankedPage />, handle: meta.arenaRanked },
                { path: 'friend', element: <ArenaFriendPage />, handle: meta.arenaFriend },
                { path: 'challenges', element: <ArenaChallengesPage />, handle: meta.challenges },
                { path: 'battles/:battleId', element: <ArenaBattlePage />, handle: meta.battle },
                { path: 'battles/:battleId/replay', element: <ArenaReplayPage />, handle: meta.replay },
                { path: 'history', element: <ArenaHistoryPage />, handle: meta.battleHistory },
                { path: 'leaderboard', element: <ArenaLeaderboardPage />, handle: meta.leaderboard },
              ],
            },
            { path: 'profile', element: <ProfilePage />, handle: meta.profile },
            { path: 'profile/friends', element: <ProfileFriendsPage />, handle: meta.friends },
            { path: 'community', element: <CommunityPage />, handle: meta.community },
            { path: 'summoners/:username', element: <CommunitySummonerPage />, handle: meta.summoner },
            { path: 'settings', element: <SettingsPage />, handle: meta.settings },
            { path: '*', element: <NotFoundPage />, handle: meta.notFound },
          ],
        },
      ],
    },
  ],
  { basename: '/play' },
)

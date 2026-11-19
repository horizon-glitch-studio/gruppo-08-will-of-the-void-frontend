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

/**
 * Router of the /play app. Paths are relative to the basename /play.
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
            { index: true, element: <HubPage /> },
            {
              path: 'shop',
              children: [
                { index: true, element: <ShopPage /> },
                { path: 'openings/:openingId', element: <ShopPackOpeningPage /> },
                { path: 'history', element: <ShopHistoryPage /> },
              ],
            },
            {
              path: 'ship',
              children: [
                { index: true, element: <Navigate to="collection" replace /> },
                { path: 'collection', element: <ShipCollectionPage /> },
                { path: 'collection/:cardId', element: <ShipCollectionCardPage /> },
                { path: 'decks', element: <ShipDecksPage /> },
                { path: 'decks/new', element: <ShipDeckEditorPage /> },
                { path: 'decks/:deckId', element: <ShipDeckEditorPage /> },
                { path: 'trades', element: <ShipTradesPage /> },
                { path: 'trades/new', element: <ShipTradeNewPage /> },
                { path: 'trades/:tradeId', element: <ShipTradeDetailPage /> },
              ],
            },
            {
              path: 'arena',
              children: [
                { index: true, element: <ArenaPage /> },
                { path: 'quick', element: <ArenaQuickPage /> },
                { path: 'ranked', element: <ArenaRankedPage /> },
                { path: 'friend', element: <ArenaFriendPage /> },
                { path: 'challenges', element: <ArenaChallengesPage /> },
                { path: 'battles/:battleId', element: <ArenaBattlePage /> },
                { path: 'battles/:battleId/replay', element: <ArenaReplayPage /> },
                { path: 'history', element: <ArenaHistoryPage /> },
                { path: 'leaderboard', element: <ArenaLeaderboardPage /> },
              ],
            },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'profile/friends', element: <ProfileFriendsPage /> },
            { path: 'community', element: <CommunityPage /> },
            { path: 'summoners/:username', element: <CommunitySummonerPage /> },
            { path: 'settings', element: <SettingsPage /> },
          ],
        },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ],
  { basename: '/play' },
)

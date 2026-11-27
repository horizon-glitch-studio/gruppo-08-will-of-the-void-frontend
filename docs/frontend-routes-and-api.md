# Frontend routes and API needs

Sources:

- API contract draft and implemented routes: `gruppo-08-will-of-the-void-backend`, `api-contract-draft/`, commit `e42f93a` (16 Nov 2026).
- Rules: `gruppo-08-will-of-the-void-docs/rules/`, commit `e7c1de6` (16 Nov 2026).

All endpoints are relative to `/api/v1`.

## 1. Sitemap

| Area | Routes | Rendering |
| --- | --- | --- |
| Static site | `/`, `/lore/`, `/rulebook/`, `/rulebook/glossary/`, `/about/`, `/support/`, `/privacy/`, `/terms/`, `/cookies/`, `/404.html` | Plain HTML, indexed |
| Game platform | `/play/*` | React app, login required except the auth screens |
| Backoffice | `/admin/*` | React app, `ADMIN` role |

## 2. Shared by every `/play` screen

| Element | Data | Endpoint | Notes |
| --- | --- | --- | --- |
| Session | access and refresh token | `POST /auth/refresh`, `POST /auth/logout` | Access token lasts 900 s: refresh on `401 TOKEN_INVALID`, then retry once. |
| Top bar | `shardBalance`, `trophies`, `league`, `avatar`, `username` | `GET /users/me` | Refetch after any action that changes Shards or Trophies. |
| Notification badge | unread count | `GET /users/me/notifications/unread-count` | Poll every 30 s while the app is open (contract). |
| Presence | heartbeat | **gap** (G2) | Every 30 s (contract). |
| Daily and comeback bonus | `dailyBonus`, `comebackBonus` | response of `POST /auth/login` | Shown once after login. |
| Errors | `code`, `fieldErrors`, `details` | every endpoint | The UI chooses the text from `code`; `message` is never shown. |

## 3. Static site

No login needed.

| Route | Data shown | Endpoint | Notes |
| --- | --- | --- | --- |
| `/` home, season box | season number and end date; active event pack: name, dates, Wanderer cards | **gap** (G1) | If the call fails, the static text stays. |
| `/` home, card showcase | a few cards: name, faction, rarity, ATK, DEF, image | `GET /cards` | Could also be read at build time. |
| `/rulebook/`, `/rulebook/glossary/` | factions, rarities, advantages, deck rules | `GET /game-data` | Optional: read at build time to keep numbers in sync with the server. |
| other static pages | – | – | No API. |

## 4. Game platform `/play`

Every `/play` route needs login, except Account access.

### Account access

| Route | Data shown | Actions | Endpoints | Notes |
| --- | --- | --- | --- | --- |
| `/play/login` | – | log in with username or email | `POST /auth/login` | Errors: `INVALID_CREDENTIALS`. |
| `/play/register` | – | create account; time zone read from the browser (`UTC` becomes `Etc/UTC`: the backend accepts only names with a region); optional invite code | `POST /auth/register` | Errors: `USERNAME_ALREADY_USED`, `EMAIL_ALREADY_USED`, `INVITE_CODE_INVALID`, `fieldErrors`. Starter deck and registration bonus are given by the server. |
| `/play/forgot-password` | – | ask for a reset link | `POST /auth/forgot-password` | Always 202: same message whether the email exists or not. |
| `/play/reset-password?token=` | – | choose a new password | `POST /auth/reset-password` | Email link: `{APP_FRONTEND_URL}/reset-password?token=`, where `APP_FRONTEND_URL` ends with `/play`. |
| `/play/verify-email?token=` | result | verify email | `POST /auth/verify-email` | Email link: `{APP_FRONTEND_URL}/verify-email?token=`, where `APP_FRONTEND_URL` ends with `/play`. |

### Home hub

| Route | Data shown | Actions | Endpoints | Notes |
| --- | --- | --- | --- | --- |
| `/play` | top bar; pending challenges and trades as badges on Arena and Ship | open Story and Tutorial | `GET /users/me`, `GET /users/me/notifications/unread-count` | Tutorial is client-side. |

### Shop and packs

| Route | Data shown | Actions | Endpoints | Notes |
| --- | --- | --- | --- | --- |
| `/play/shop` | Shard balance; packs on sale: name, kind, cost, event dates, odds per slot, guarantees, event Wanderer cards | buy and open a pack | `GET /packs`, `POST /packs/{packTypeId}/open` | `INSUFFICIENT_SHARDS` carries `shardBalance` and `shardCost`. `Idempotency-Key` is not implemented: disable the button while the request is running, or a double click buys two packs. |
| `/play/shop/openings/{openingId}` | the 5 cards, `isNew`, `expiresAt` for Wanderers, guarantee used, new balance | back to the Shop | response of `open`; reload with `GET /users/me/pack-openings/{openingId}` | Full-screen route drawn as a layer over the Shop, with the opening animation. A reload keeps the result. |
| `/play/shop/history` | past openings; Shard transactions with reason and amount | – | `GET /users/me/pack-openings`, `GET /users/me/shard-transactions` | Paginated, newest first. |

### Ship: collection, decks, trades

| Route | Data shown | Actions | Endpoints | Notes |
| --- | --- | --- | --- | --- |
| `/play/ship` | – | – | – | Redirects to `/play/ship/collection`. |
| `/play/ship/collection` | collection: card, quantity, `expiresAt` (Wanderer time left); **Archive** tab: departed Wanderers with departure date | filter by faction, rarity, name; switch tab | `GET /users/me/collection`, `GET /users/me/archive`, `GET /game-data` | Filters: `factionId`, `rarityId`, `availableInDeck`. Name search: see G13. Archive tab in the URL (`?tab=archive`) so it can be linked. |
| `/play/ship/collection/{cardId}` | card details, quantity, dates | – | `GET /users/me/collection/{cardId}` | |
| `/play/ship/decks` | decks: name, status, `totalCards`, `isDefenseDeck`, `validationErrors` | set or remove defense deck, delete | `GET /users/me/decks`, `PUT`/`DELETE /users/me/decks/{deckId}/defense`, `DELETE /users/me/decks/{deckId}` | Max 20 decks (`DECK_LIMIT_REACHED`). `DEFENSE_DECK_INVALID` if the deck is not `VALID`. |
| `/play/ship/decks/new`, `/play/ship/decks/{deckId}` | deck editor: cards in deck, collection to add from, live status | save, validate while editing | `POST /users/me/decks`, `GET`/`PUT /users/me/decks/{deckId}`, `POST /users/me/decks/validate`, `GET /users/me/collection?availableInDeck=true` | Invalid decks can be saved as drafts. `validationErrors` gives code, limit and actual value per rule. |
| `/play/ship/trades` | trades: other player, cards on each side, status, `expiresAt` | accept, reject, cancel | `GET /trades?direction=&status=`, `POST /trades/{id}/accept`, `/reject`, `/cancel` | `TRADE_FAILED`, `TRADE_MIN_COLLECTION`, `TRADE_NOT_PENDING` (status in `details.status`), `EMAIL_NOT_VERIFIED`. |
| `/play/ship/trades/new?to={username}` | my collection, the other player's tradeable cards | propose a trade | `POST /trades` | **gap** (G11). |
| `/play/ship/trades/{tradeId}` | one trade | as above | `GET /trades/{tradeId}` | |

### Arena

| Route | Data shown | Actions | Endpoints | Notes |
| --- | --- | --- | --- | --- |
| `/play/arena` | modes Friend, Quick, Ranked; defense deck status; shield until | choose a mode | `GET /users/me` (`defenseDeckId`, `protectedUntil`), `GET /users/me/decks/{id}` | Ranked needs a valid defense deck. |
| `/play/arena/quick`, `/play/arena/ranked` | 5 opponents: username, avatar, trophies, Orbit, already attacked; refresh cooldown | refresh list, attack with a chosen deck | `GET /matchmaking/opponents?mode=`, `POST /matchmaking/opponents/refresh`, `POST /matchmaking/opponents/{opponentId}/battle` | **gap** (G4). Errors: `OPPONENT_ALREADY_ATTACKED`, `MATCHMAKING_COOLDOWN`, `DECK_INVALID`. |
| `/play/arena/friend` | friends list | challenge a friend with a chosen deck | `GET /friends`, `POST /battles/friend` | 201 `PLAYED` (instant) or `PENDING` (challenge). |
| `/play/arena/challenges` | pending challenges received and sent, expiry | accept with a deck, reject, cancel | **gap** (G3) for the list; `POST /battles/{id}/accept`, `/reject`, `/cancel` | |
| `/play/arena/battles/{battleId}` | result: winner, final Energy, Trophy change | rematch (Friend, Quick) | `GET /battles/{battleId}`, `GET /battles/{battleId}/result`, `POST /battles/{battleId}/rematch` | **gap** (G7). |
| `/play/arena/battles/{battleId}/replay` | both decks, every clash and round: cards, ATK, DEF, advantage, Energy | play, pause, step | `GET /battles/{battleId}/replay` | **gap** (G7). Replays last 90 days: show a message when expired. |
| `/play/arena/history` | past battles: mode, opponent, outcome, date | filter by mode and outcome | `GET /users/me/battles` | Paginated, newest first. |
| `/play/arena/leaderboard` | season, global or per Orbit ranking | switch Orbit | `GET /leaderboard?orbit=`, `GET /seasons/current` | **gap** (G8). |

### Profile, community, settings, notifications

| Route | Data shown | Actions | Endpoints | Notes |
| --- | --- | --- | --- | --- |
| `/play/profile` | own profile as others see it: avatar, username, trophies, Orbit, stats; plus invite code, email verification status | change avatar, resend verification email | `GET /users/me`, `PATCH /users/me` (`avatar`), `POST /auth/resend-verification`, avatars list (G5) | |
| `/play/profile/friends` | friends with online status; requests received and sent | accept, reject, remove, cancel | `GET /friends`, `GET /friend-requests?direction=`, `POST /friend-requests/{id}/accept`, `/reject`, `DELETE /friends/{id}` | Max 100 friends, 10 sent requests. **gap** (G10). |
| `/play/community` | search results: username, avatar, trophies, Orbit | search Summoners by name, open a profile | **gap** (G14) | Today only exact-username lookup exists (`GET /users/{username}`). |
| `/play/summoners/{username}` | public profile: avatar, trophies, Orbit, stats | send friend request, challenge, propose trade | `GET /users/{username}`, `POST /friend-requests`, `POST /battles/friend`, link to `/play/ship/trades/new?to=` | Reached from leaderboard, opponent list, friends, notifications, community. `PLAYER_NOT_FOUND` for deleted accounts. |
| `/play/settings` | one page in sections: Accessibility (reduce motion, reduce transparency, text labels), Time zone, Security (change password), Account (log out, delete account) | each switch saves on change; time zone and password have their own button; deletion in a modal with the password | `GET`/`PATCH /users/me/settings`, `PATCH /users/me` (`timezone`), `PUT /users/me/password`, `DELETE /users/me` | No nested routes: sections are anchors (`#accessibility`, `#time-zone`, `#security`, `#account`). `TIMEZONE_CHANGE_TOO_SOON`. A wrong password (`INVALID_CREDENTIALS`) is shown on the password field. The password change revokes every refresh token: the page logs in again with the new password, in the same session. Username and email cannot change in v1. |
| notifications panel | last 20 notifications by type, read state | load more, mark read, mark all read, delete; each item opens the related screen | `GET /users/me/notifications`, `PATCH /users/me/notifications/{id}`, `POST /users/me/notifications/read-all`, `DELETE /users/me/notifications/{id}` | Side panel, full screen on mobile. No dedicated page in the MVP. Notifications carry only ids: details come from the related route. |
| `/play/*` unknown | – | – | – | 404 screen in the Void's voice. |

## 5. Backoffice `/admin`

The contract has no backoffice routes yet. The backend reserves `/api/v1/backoffice/**` for the `ADMIN` role. The brief requires at least the card catalog.

| Route | Data shown | Actions | Endpoints | Notes |
| --- | --- | --- | --- | --- |
| `/admin/login` | – | log in | `POST /auth/login` | Check `player.role === "ADMIN"`. |
| `/admin/cards` | all cards, active and inactive | search, filter, deactivate | **gap** (G6) | Required by the brief. |
| `/admin/cards/new`, `/admin/cards/{cardId}` | card form with live checks: ATK and DEF at least 1, ATK + DEF equal to the rarity points, faction balance | create, edit, upload image | **gap** (G6) | Card rules in CARD-08. |
| `/admin/packs` | pack types, slots, odds | edit | **gap** (G6) | |
| `/admin/events` | events: dates, event pack, Wanderer cards | create, edit | **gap** (G6) | One active event at a time (PACK-03). |

## 6. Gaps for the API contract

1. **G1 Public season and event.** The home page needs, without login, the current season (number, end date) and the active event pack (name, dates, Wanderer cards). Today `GET /seasons/current` and `GET /packs` require login. Proposal: make `GET /seasons/current` public and add a public `GET /events/current`.
2. **G2 Presence.** The contract asks for a heartbeat every 30 s but defines no route. Proposal: `POST /users/me/heartbeat`, 204.
3. **G3 Pending challenges.** There is no way to list challenges waiting for an answer. Proposal: `GET /users/me/battles?status=PENDING&direction=incoming|outgoing`, or `GET /battles/challenges`.
4. **G4 Opponent list.** Define the entry fields (opponent id, username, avatar, trophies, Orbit, already attacked), whether `refresh` takes `mode`, and the seconds left before the next refresh.
5. **G5 Avatars.** The schema says the frontend reads active avatars from the API, but no route lists them. Proposal: `GET /avatars`, public, ordered by `sort_order`.
6. **G6 Backoffice.** No routes yet. At least card catalog CRUD with the CARD-08 checks (brief requirement), card image upload, pack types and events.
7. **G7 Result and replay.** Define the response of `GET /battles/{id}`, `/result` and `/replay`: participants, decks, every clash and round with cards, ATK, effective ATK, DEF before and after, advantage, Energy gained; final Energy, outcome, Trophy change; the error when a replay is past 90 days.
8. **G8 Leaderboard.** Define the entry fields (position, username, avatar, trophies, Orbit) and how a player sees their own position when it is not on the current page.
9. **G9 Season.** Define the fields of `GET /seasons/current` (number, start, end).
10. **G10 Friends.** Define the fields of `GET /friends` and `GET /friend-requests` items, including online status.
11. **G11 Trade proposal.** To propose a trade the player must see the other player's tradeable cards. Proposal: `GET /users/{username}/collection?tradeable=true`, for logged-in players. Check that this fits the privacy policy.
12. **G12 Card images.** `imageUrl` is a relative path: confirm the host that serves it and whether more sizes are available for `srcset`.
13. **G13 Collection search.** `GET /cards` has `search` by name, `GET /users/me/collection` does not. The deck editor and the trade screen need it.
14. **G14 Summoner search.** The community page needs a search by partial username (paginated, active accounts only).

## 7. Ideas for after the MVP

- **Trade showcase / wishlist.** On the public profile, a Summoner can show the cards they want and the cards they offer; their decks stay private. Needs a new rule in `trades.md` and new endpoints.
- **Trade auctions.** Alternative to direct proposals. Out of scope for now.

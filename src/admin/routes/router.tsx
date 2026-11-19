import { createBrowserRouter } from 'react-router'
import { AuthLoginPage } from '../pages/AuthLoginPage'
import { CardsEditorPage } from '../pages/CardsEditorPage'
import { CardsPage } from '../pages/CardsPage'
import { NotFoundPage } from '../pages/NotFoundPage'

/**
 * Router of the /admin backoffice. Only the card catalog for now.
 * TODO: guard for the ADMIN role, as in the /play app.
 */
export const router = createBrowserRouter(
  [
    { path: 'login', element: <AuthLoginPage /> },
    { index: true, element: <CardsPage /> },
    { path: 'cards/new', element: <CardsEditorPage /> },
    { path: 'cards/:cardId', element: <CardsEditorPage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
  { basename: '/admin' },
)

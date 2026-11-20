import { createBrowserRouter } from 'react-router'
import { RequireAuth } from '@/shared/components/RequireAuth'
import { AuthLoginPage } from '../pages/AuthLoginPage'
import { CardsEditorPage } from '../pages/CardsEditorPage'
import { CardsPage } from '../pages/CardsPage'
import { NotFoundPage } from '../pages/NotFoundPage'

/**
 * Router of the /admin backoffice. Only the card catalog for now.
 */
export const router = createBrowserRouter(
  [
    { path: 'login', element: <AuthLoginPage /> },
    {
      element: <RequireAuth requiredRole="ADMIN" />,
      children: [
        { index: true, element: <CardsPage /> },
        { path: 'cards', element: <CardsPage /> },
        { path: 'cards/new', element: <CardsEditorPage /> },
        { path: 'cards/:cardId', element: <CardsEditorPage /> },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ],
  { basename: '/admin' },
)

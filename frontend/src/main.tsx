import { StrictMode, type JSX } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Orders from './pages/Orders'

function ProtectedRoute({ children }: { children: JSX.Element }) {
	const token = localStorage.getItem('access_token')
	return token ? children : <Navigate to="/login" replace />
}

function RoleGuard({ allow, children }: { allow: Array<'WORKER' | 'manager' | 'admin'>; children: JSX.Element }) {
	const role = JSON.parse(localStorage.getItem('user') || 'null')?.role
	return role && allow.includes(role) ? children : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
	{ path: '/', element: <Navigate to="/orders" replace /> },
	{ path: '/login', element: <Login /> },
	{
		path: '/orders',
		element: (
			<ProtectedRoute>
				<RoleGuard allow={['WORKER']}>
					<Orders />
				</RoleGuard>
			</ProtectedRoute>
		),
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
)

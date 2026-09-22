import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'admin' | 'reader' | 'contact'

function hasRole(req: PayloadRequest, ...roles: Role[]): boolean {
	const role = (req.user as { role?: Role } | null)?.role
	return role !== undefined && roles.includes(role)
}

export const isAdmin: Access = ({ req }) => hasRole(req, 'admin')

export const isAdminField: FieldAccess = ({ req }) => hasRole(req, 'admin')

export const canReadContent: Access = ({ req }) => hasRole(req, 'admin', 'reader')

export const canSubmitContact: Access = ({ req }) => hasRole(req, 'admin', 'contact')

export const isAdminOrSelf: Access = ({ req }) => {
	if (hasRole(req, 'admin')) return true
	if (!req.user) return false
	return { id: { equals: req.user.id } }
}


import { UserRole } from '@prisma/client';

import type { User } from '@prisma/client';

export enum Permission {
	Stranger,
	Unverified,
	UnverifiedUser,
	UnverifiedAdmin,
	Verified,
	VerifiedUser,
	VerifiedAdmin
}

export function getPermissions(user: User | null) {

	// Strangers
	if (user === null) {
		return Permission.Stranger;
	}

	// verified
	if (user.verified) {
		if (user.role === UserRole.USER)
			return Permission.VerifiedUser;
		return Permission.VerifiedAdmin;
	} 
	
	// Unverified
	if (user.role === UserRole.USER)
		return Permission.UnverifiedUser;
	return Permission.UnverifiedAdmin;
}

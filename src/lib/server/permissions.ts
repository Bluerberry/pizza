
import { UserRole } from "@prisma/client";
import type { User } from "@prisma/client";

export enum Permission {
	STRANGER = 0,
	UNVERIFIED = 1,
	USER = 2,
	ADMIN = 3
}

export function hasPermission(user: User | null, min: Permission, max: Permission = Permission.ADMIN): boolean {
	
	// Find user permissions
	let userPermissions: Permission;
	if (!user) userPermissions = Permission.STRANGER;
	else if (user.role === UserRole.ADMIN) userPermissions = Permission.ADMIN;
	else if (!user.verified) userPermissions = Permission.UNVERIFIED;
	else userPermissions = Permission.USER;

	// Check if user has the required permissions
	return userPermissions >= min && userPermissions <= max;
}

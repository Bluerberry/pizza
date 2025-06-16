
import { UserRole } from "@prisma/client";
import type { User } from "@prisma/client";

export enum Permission {
	STRANGER = 0,
	USER = 2,
	ADMIN = 3
}

function getPermissions(user: User | null) {
	if (!user) {
		return Permission.STRANGER;
	} else if (user.role === UserRole.ADMIN) {
		return Permission.ADMIN;
	} else {
		return Permission.USER;
	}
}

export function hasAtLeastPermission(user: User | null, permission: Permission): boolean {
	return getPermissions(user) >= permission;
}

export function hasExactlyPermission(user: User | null, permission: Permission): boolean {
	return getPermissions(user) == permission;
}

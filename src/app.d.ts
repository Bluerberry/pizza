
import type { User } from "@prisma/client";
import type { Permission } from "$lib/scripts/permissions";

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			permissions: Permission;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

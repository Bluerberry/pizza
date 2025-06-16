
import type { User } from "@prisma/client";

declare global {
	namespace App {
		interface Locals {
			user: User | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};


import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();

    // Redirect appropriately
    if (session === null) {
        redirect(303, './control/new-session');
    } else {
        redirect(303, './control/dashboard');
    }
};
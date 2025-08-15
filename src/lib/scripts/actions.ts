
import { tick } from "svelte";

export function clickoutside(element: HTMLElement, callback: () => any) {
	function onClick(event: MouseEvent) {
		if (
            element && 
            !element.contains(event.target as Node) &&
            !event.defaultPrevented
        ) {
			callback();
		}
	}

    tick().then(() => {
        document.body.addEventListener('click', onClick);
    })

	return {
		destroy() {
			document.body.removeEventListener('click', onClick);
		}
	};
}
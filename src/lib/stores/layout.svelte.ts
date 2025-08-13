
import { MediaQuery } from 'svelte/reactivity';

const desktop = new MediaQuery('min-width: 1000px', false)
const tablet = new MediaQuery('min-width: 600px', false)

const layout = {
	get value() {
		return desktop.current ? 'desktop' :
			   tablet.current ? 'tablet' :
			   'phone'
	}
}

export default layout;
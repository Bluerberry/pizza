
type Theme = 'light' | 'dark';

const theme = $state<{ value: Theme }>({
	value: 'dark'
});

export default theme;
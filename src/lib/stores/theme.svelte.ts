
type Theme = 'light' | 'dark';
export const theme = $state<{ value: Theme }>({
    value: 'dark'
});
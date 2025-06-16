
export type NavitemData = {
    label: string;
    path: string;
    children?: undefined;
} | {
    label: string;
    path?: undefined;
    children: NavitemData[];
};

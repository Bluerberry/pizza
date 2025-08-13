
export type NavitemData = {
    label: string;
    path: string;
    children?: undefined;
    permissions?: Permission;
} | {
    label: string;
    path?: undefined;
    children: NavitemData[];
    permissions?: Permission;
};

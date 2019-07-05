export as namespace restifyRouterMagic;

type RestifyRouterMagic = (
    server: object,
    config?: RestifyRouterMagicConfig,
    callback?: CompletionCallback
) => void;
export default RestifyRouterMagic;

interface RestifyRouterMagicConfig {
    camelCase?: "force" | "never" | "both";
    indexWithSlash?: "force" | "never" | "both";
    options?: any;
    routesMatch?: string;
    routesPath: string;
    sync: boolean;
}

type CompletionCallback = (error?: object) => void;

export type RouteHandler = (
    request: object,
    response: object,
    next: CompletionCallback
) => void;

export type RouteObject = {
    name?: string;
} & {
    [key: string]: RouteHandler;
};

export type RouteFactory = (
    server: object,
    path: string,
    options: any
) => RouteObject;

export type Route = RouteObject | RouteFactory;

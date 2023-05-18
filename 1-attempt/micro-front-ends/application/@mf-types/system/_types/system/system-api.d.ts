export declare const systemApi: import("@reduxjs/toolkit/query/react").Api<import("@reduxjs/toolkit/query/react").BaseQueryFn<string | import("@reduxjs/toolkit/query/react").FetchArgs, unknown, import("@reduxjs/toolkit/query/react").FetchBaseQueryError, {}, import("@reduxjs/toolkit/query/react").FetchBaseQueryMeta>, {
    createSystem: import("@reduxjs/toolkit/query/react").MutationDefinition<import("./types").NewSystemPayload, import("@reduxjs/toolkit/query/react").BaseQueryFn, "system", void, "system">;
    deleteSystem: import("@reduxjs/toolkit/query/react").MutationDefinition<string, import("@reduxjs/toolkit/query/react").BaseQueryFn, "system", import("./types").IdPayload, "system">;
    readPaginatedSystems: import("@reduxjs/toolkit/query/react").QueryDefinition<import("./types").PaginationParameters, import("@reduxjs/toolkit/query/react").BaseQueryFn, "system", import("./types").PaginatedResults, "system">;
    readSystemByUrlPath: import("@reduxjs/toolkit/query/react").QueryDefinition<string, import("@reduxjs/toolkit/query/react").BaseQueryFn, "system", import("./types").ClientSystem, "system">;
    updateSystem: import("@reduxjs/toolkit/query/react").MutationDefinition<import("./types").UpdateSystemPayload, import("@reduxjs/toolkit/query/react").BaseQueryFn, "system", import("./types").IdPayload, "system">;
}, "system", "system", typeof import("@reduxjs/toolkit/dist/query/core/module").coreModuleName | typeof import("@reduxjs/toolkit/dist/query/react/module").reactHooksModuleName>;
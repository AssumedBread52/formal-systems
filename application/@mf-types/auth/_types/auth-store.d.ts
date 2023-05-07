export declare const authStore: import("@reduxjs/toolkit/dist/configureStore").ToolkitStore<{
    auth: import("@reduxjs/toolkit/dist/query/core/apiState").CombinedState<{
        refreshToken: import("@reduxjs/toolkit/dist/query").MutationDefinition<void, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
        signInUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<import("./types").SignInPayload, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
        signOutUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<void, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", void, "auth">;
        signUpUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<import("./types").SignUpPayload, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
    }, never, "auth">;
}, import("redux").AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("@reduxjs/toolkit").ThunkMiddleware<{
    auth: import("@reduxjs/toolkit/dist/query/core/apiState").CombinedState<{
        refreshToken: import("@reduxjs/toolkit/dist/query").MutationDefinition<void, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
        signInUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<import("./types").SignInPayload, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
        signOutUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<void, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", void, "auth">;
        signUpUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<import("./types").SignUpPayload, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
    }, never, "auth">;
}, import("redux").AnyAction>, import("redux").Middleware<{}, import("@reduxjs/toolkit/dist/query/core/apiState").RootState<{
    refreshToken: import("@reduxjs/toolkit/dist/query").MutationDefinition<void, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
    signInUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<import("./types").SignInPayload, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
    signOutUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<void, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", void, "auth">;
    signUpUser: import("@reduxjs/toolkit/dist/query").MutationDefinition<import("./types").SignUpPayload, import("@reduxjs/toolkit/dist/query").BaseQueryFn, "auth", import("./types").TokenPayload, "auth">;
}, string, "auth">, import("@reduxjs/toolkit").ThunkDispatch<any, any, import("redux").AnyAction>>, (_: import("redux").MiddlewareAPI<import("redux").Dispatch<import("redux").AnyAction>, any>) => (next: import("redux").Dispatch<import("redux").AnyAction>) => (action: any) => any]>>;

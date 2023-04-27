export declare const useSignInUser: () => {
    signInUser: import("@reduxjs/toolkit/dist/query/react/buildHooks").MutationTrigger<import("@reduxjs/toolkit/dist/query").MutationDefinition<import("../types").SignInPayload, import("@reduxjs/toolkit/dist/query").BaseQueryFn, never, boolean, "auth">>;
    errorMessage: string;
    isLoading: boolean;
};

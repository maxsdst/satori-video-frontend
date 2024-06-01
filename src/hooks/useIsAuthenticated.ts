import useOwnProfile from "./profiles/useOwnProfile";

function useIsAuthenticated() {
    const { data, isLoading, isSuccess, error } = useOwnProfile();
    if (isLoading) return undefined;
    if (error) throw error;

    return isSuccess ? !!data : undefined;
}

export default useIsAuthenticated;

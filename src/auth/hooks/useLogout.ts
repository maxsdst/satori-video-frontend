import { clearAuthTokens } from "axios-jwt";

function useLogout() {
    return () => {
        clearAuthTokens();
    };
}

export default useLogout;

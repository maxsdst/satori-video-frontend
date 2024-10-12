import { useTitle } from "react-use";

function useResetTitle() {
    useTitle(import.meta.env.VITE_WEBSITE_NAME as string);
}

export default useResetTitle;

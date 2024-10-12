import { useTitle as _useTitle } from "react-use";

function useTitle(title: string) {
    _useTitle(
        title.trim() + " - " + (import.meta.env.VITE_WEBSITE_NAME as string)
    );
}

export default useTitle;

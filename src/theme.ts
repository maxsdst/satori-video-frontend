import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: "dark",
};

const theme = extendTheme({
    config,
    colors: {
        gray: {
            50: "#eff1f5",
            100: "#d2d5dc",
            200: "#b4b9c6",
            300: "#959eb1",
            400: "#77829c",
            500: "#5e6884",
            600: "#495166",
            700: "#353a48",
            800: "#20232b",
            900: "#0a0c10",
        },
    },
});

export default theme;

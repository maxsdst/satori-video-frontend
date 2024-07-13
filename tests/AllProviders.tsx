import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const AllProviders = ({ children }: PropsWithChildren) => {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return (
        <ChakraProvider>
            <QueryClientProvider client={client}>
                {children}
            </QueryClientProvider>
        </ChakraProvider>
    );
};

export default AllProviders;

import { HStack, Progress, Text, VStack } from "@chakra-ui/react";

interface Props {
    label: string;
    percentCompleted?: number;
    isIndeterminate?: boolean;
}

function ProgressBar({ isIndeterminate, label, percentCompleted }: Props) {
    return (
        <VStack width="100%">
            <HStack width="100%" justifyContent="space-between">
                <Text>{label}</Text>
                {typeof percentCompleted === "number" && (
                    <Text>{percentCompleted}%</Text>
                )}
            </HStack>
            <Progress
                aria-label={label}
                hasStripe
                isIndeterminate={isIndeterminate}
                value={percentCompleted}
                width="100%"
            />
        </VStack>
    );
}

export default ProgressBar;

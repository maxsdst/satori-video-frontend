import {
    Button,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Filter } from "../../../services/BaseQuery";
import { FilteringOption } from "./filteringReducer";

const schema = z.object({
    value: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    option: FilteringOption;
    isOpen: boolean;
    onClose: () => void;
    onApplyFilter: (filter: Filter) => void;
}

function BooleanFilterModal({ option, isOpen, onClose, onApplyFilter }: Props) {
    const { handleSubmit, control } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{option.name}</ModalHeader>
                <ModalCloseButton />
                <form
                    onSubmit={handleSubmit((data) => {
                        onApplyFilter({
                            field: option.field,
                            type: "boolean",
                            lookupType: "exact",
                            value: data.value,
                        });
                        onClose();
                    })}
                >
                    <ModalBody paddingY={0}>
                        <Controller
                            control={control}
                            name="value"
                            defaultValue={true}
                            render={({ field: { onChange } }) => (
                                <RadioGroup
                                    defaultValue="true"
                                    onChange={(value) =>
                                        onChange(
                                            value === "true" ? true : false
                                        )
                                    }
                                >
                                    <HStack>
                                        <Radio value="true">Yes</Radio>
                                        <Radio value="false">No</Radio>
                                    </HStack>
                                </RadioGroup>
                            )}
                        ></Controller>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" type="submit">
                            Apply
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export default BooleanFilterModal;

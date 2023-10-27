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
    Select,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../../../forms/Input";
import { Filter } from "../../../services/BaseQuery";
import { FilteringOption } from "./filteringReducer";

const schema = z.object({
    lookupType: z.union([z.literal("lte"), z.literal("gte")]),
    value: z.number(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    option: FilteringOption;
    isOpen: boolean;
    onClose: () => void;
    onApplyFilter: (filter: Filter) => void;
}

function NumberFilterModal({ option, isOpen, onClose, onApplyFilter }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
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
                            type: "number",
                            lookupType: data.lookupType,
                            value: data.value,
                        });
                        onClose();
                    })}
                >
                    <ModalBody paddingY={0}>
                        <HStack alignItems="start">
                            <Select {...register("lookupType")}>
                                <option value="gte" selected>
                                    {">="}
                                </option>
                                <option value="lte">{"<="}</option>
                            </Select>
                            <Input
                                type="number"
                                inputProps={{
                                    ...register("value", {
                                        setValueAs: (value) => Number(value),
                                    }),
                                }}
                                isInvalid={!!errors.value}
                                errorMessage={errors.value?.message}
                                placeholder="Value"
                            />
                        </HStack>
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

export default NumberFilterModal;

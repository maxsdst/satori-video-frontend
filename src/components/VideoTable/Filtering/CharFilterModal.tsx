import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../../../forms/Input";
import { Filter } from "../../../services/BaseQuery";
import { Option } from "./filteringReducer";

const schema = z.object({
    value: z.string().nonempty("Value is required."),
});

type FormData = z.infer<typeof schema>;

interface Props {
    option: Option;
    isOpen: boolean;
    onClose: () => void;
    onApplyFilter: (filter: Filter) => void;
}

function CharFilterModal({ option, isOpen, onClose, onApplyFilter }: Props) {
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
                            type: "char",
                            lookupType: "icontains",
                            value: data.value,
                        });
                        onClose();
                    })}
                >
                    <ModalBody paddingY={0}>
                        <Input
                            type="text"
                            label="contains"
                            placeholder="Value"
                            inputProps={{ ...register("value") }}
                            isInvalid={!!errors.value}
                            errorMessage={errors.value?.message}
                        />
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

export default CharFilterModal;

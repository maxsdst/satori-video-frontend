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
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    header: string;
    children?: ReactNode;
}

function LoginRequestModal({ header, isOpen, onClose, children }: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>{children}</ModalBody>
                <ModalFooter>
                    <Link to="/login" state={{ next: window.location.href }}>
                        <Button colorScheme="blue">Sign in</Button>
                    </Link>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default LoginRequestModal;

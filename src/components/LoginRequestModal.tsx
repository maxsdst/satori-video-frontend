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
import { Link, useLocation } from "react-router-dom";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    header: string;
    children?: ReactNode;
}

function LoginRequestModal({ header, isOpen, onClose, children }: Props) {
    const location = useLocation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent data-testid="login-request-modal">
                <ModalHeader>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>{children}</ModalBody>
                <ModalFooter>
                    <Link to="/login" state={{ next: location.pathname }}>
                        <Button colorScheme="blue">Sign in</Button>
                    </Link>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default LoginRequestModal;

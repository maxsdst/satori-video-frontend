import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    BYTES_IN_MB,
    MAX_IMAGE_SIZE_MB,
    PROFILE_DESCRIPTION_MAX_LENGTH,
    PROFILE_FULL_NAME_MAX_LENGTH,
} from "../../constants";
import Input from "../../forms/Input";
import Textarea from "../../forms/Textarea";
import useOwnProfile from "../../hooks/profiles/useOwnProfile";
import useProfile from "../../hooks/profiles/useProfile";
import useUpdateOwnProfile from "../../hooks/profiles/useUpdateOwnProfile";
import AvatarInput from "./AvatarInput";

const ACCEPTED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const schema = z.object({
    full_name: z
        .string()
        .nonempty("Full name is required.")
        .max(
            PROFILE_FULL_NAME_MAX_LENGTH,
            `Full name cannot be longer than ${PROFILE_FULL_NAME_MAX_LENGTH} characters`
        ),
    description: z
        .string()
        .max(
            PROFILE_DESCRIPTION_MAX_LENGTH,
            `Description cannot be longer than ${PROFILE_DESCRIPTION_MAX_LENGTH} characters`
        ),
    avatar: z
        .instanceof(FileList)
        .refine(
            (files: FileList) =>
                files.length === 0 ||
                files[0].size <= MAX_IMAGE_SIZE_MB * BYTES_IN_MB,
            `Max image size is ${MAX_IMAGE_SIZE_MB}MB`
        )
        .refine(
            (files: FileList) =>
                files.length === 0 || files[0].type in ACCEPTED_IMAGE_TYPES,
            "This file format is not supported. Supported formats: " +
                Object.values(ACCEPTED_IMAGE_TYPES).join(", ")
        ),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

function EditProfileModal({ isOpen, onClose }: Props) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const updateOwnProfile = useUpdateOwnProfile({
        onError: (data) => {
            if (data.full_name)
                setError("full_name", { message: data.full_name.join(" ") });
            if (data.description)
                setError("description", {
                    message: data.description.join(" "),
                });
            if (data.avatar)
                setError("avatar", { message: data.avatar.join(" ") });
        },
    });

    const ownProfile = useOwnProfile();
    const profile = useProfile(ownProfile.data?.user.username as string, {
        enabled: !!ownProfile.data?.user.username,
    });

    if (ownProfile.isLoading) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <form
                    onSubmit={handleSubmit((data) => {
                        updateOwnProfile.mutate(
                            { ...data, avatar: data.avatar[0] },
                            {
                                onSuccess: () => {
                                    void ownProfile.refetch();
                                    void profile.refetch();
                                    onClose();
                                },
                            }
                        );
                    })}
                >
                    <ModalHeader>Edit profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack alignItems="start" spacing={4}>
                            <AvatarInput
                                avatar={ownProfile.data?.avatar || undefined}
                                inputProps={register("avatar")}
                                isInvalid={!!errors.avatar}
                                errorMessage={errors.avatar?.message as string}
                            />
                            <Input
                                type="text"
                                label="Full name"
                                inputProps={{
                                    defaultValue: ownProfile.data?.full_name,
                                    ...register("full_name"),
                                }}
                                isInvalid={!!errors.full_name}
                                errorMessage={errors.full_name?.message}
                            />
                            <Textarea
                                label="Description"
                                textareaProps={{
                                    defaultValue: ownProfile.data?.description,
                                    rows: 6,
                                    ...register("description"),
                                }}
                                isInvalid={!!errors.description}
                                errorMessage={errors.description?.message}
                            />
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="submit"
                            colorScheme="blue"
                            isDisabled={updateOwnProfile.isLoading}
                        >
                            {updateOwnProfile.isLoading ? "Saving..." : "Save"}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export default EditProfileModal;

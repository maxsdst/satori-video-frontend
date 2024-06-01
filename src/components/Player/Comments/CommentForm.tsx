import {
    Avatar,
    Box,
    Button,
    FormControl,
    FormErrorMessage,
    HStack,
    Textarea,
    VStack,
    useBoolean,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ref, forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { COMMENT_TEXT_MAX_LENGTH } from "../../../constants";
import useOwnProfile from "../../../hooks/profiles/useOwnProfile";

const schema = z.object({
    text: z
        .string()
        .nonempty("Text cannot be empty")
        .max(
            COMMENT_TEXT_MAX_LENGTH,
            `Text cannot be longer than ${COMMENT_TEXT_MAX_LENGTH} characters`
        ),
});

type FormData = z.infer<typeof schema>;

export interface ErrorData {
    text?: string[];
    detail?: string[];
}

export interface CommentFormHandle {
    deactivate: () => void;
    reset: () => void;
}

interface Props {
    onSubmit: (data: FormData) => void;
    errorData?: ErrorData;
    isAlwaysActive?: boolean;
    onClose?: () => void;
    avatarSize: "sm" | "md";
    textareaPlaceholder: string;
    textareaAutoFocus?: boolean;
    defaultTextareaValue?: string;
    submitButtonText: string;
    mentionedUsername?: string;
    onInput?: () => void;
}

const CommentForm = forwardRef(
    (
        {
            onSubmit,
            errorData,
            isAlwaysActive,
            onClose,
            avatarSize,
            textareaPlaceholder,
            textareaAutoFocus,
            defaultTextareaValue,
            submitButtonText,
            mentionedUsername,
            onInput,
        }: Props,
        ref: Ref<CommentFormHandle>
    ) => {
        const {
            register,
            handleSubmit,
            setError,
            formState: { errors },
            reset,
        } = useForm<FormData>({
            resolver: zodResolver(schema),
        });

        useEffect(() => {
            if (errorData?.text)
                setError("text", { message: errorData.text.join(" ") });
        }, [errorData]);

        const { data: ownProfile, isLoading, error } = useOwnProfile();

        const [
            isSubmitButtonEnabled,
            { on: enableSubmitButton, off: disableSubmitButton },
        ] = useBoolean(false);

        const [isActive, { on: activate, off: deactivate }] =
            useBoolean(isAlwaysActive);

        useImperativeHandle(ref, () => ({ deactivate, reset }));

        if (isLoading || error) return null;

        return (
            <form onSubmit={handleSubmit((data) => onSubmit(data))}>
                <HStack spacing={4} alignItems="start">
                    <Avatar
                        src={ownProfile?.avatar || undefined}
                        size={avatarSize}
                    />
                    <VStack width="100%" alignItems="end">
                        {mentionedUsername && (
                            <Box
                                alignSelf="start"
                                fontSize="sm"
                                backgroundColor="gray.600"
                                paddingX={2}
                                paddingY="3px"
                                borderRadius="18px"
                            >
                                @{mentionedUsername}
                            </Box>
                        )}
                        <FormControl
                            isInvalid={!!errors.text || !!errorData?.detail}
                        >
                            <Textarea
                                {...register("text")}
                                defaultValue={defaultTextareaValue}
                                as={TextareaAutosize}
                                variant="flushed"
                                size="sm"
                                rows={1}
                                maxRows={5}
                                resize="none"
                                autoFocus={textareaAutoFocus}
                                placeholder={textareaPlaceholder}
                                onInput={(e) => {
                                    onInput?.();
                                    e.currentTarget.value
                                        ? enableSubmitButton()
                                        : disableSubmitButton();
                                }}
                                onFocus={activate}
                            />
                            {errors.text && (
                                <FormErrorMessage>
                                    {errors.text.message}
                                </FormErrorMessage>
                            )}
                            {errorData?.detail && (
                                <FormErrorMessage>
                                    {errorData.detail.join(" ")}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        {isActive && (
                            <HStack spacing={1}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="18px"
                                    onClick={() => {
                                        if (!isAlwaysActive) deactivate();
                                        reset();
                                        onClose?.();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="solid"
                                    colorScheme="blue"
                                    size="sm"
                                    borderRadius="18px"
                                    isDisabled={!isSubmitButtonEnabled}
                                >
                                    {submitButtonText}
                                </Button>
                            </HStack>
                        )}
                    </VStack>
                </HStack>
            </form>
        );
    }
);

export default CommentForm;

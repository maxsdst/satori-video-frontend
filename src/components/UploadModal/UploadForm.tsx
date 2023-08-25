import {
    Button,
    FormControl,
    FormErrorMessage,
    Icon,
    Text,
    VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useForm, useWatch } from "react-hook-form";
import { AiOutlineUpload } from "react-icons/ai";
import { z } from "zod";
import { BYTES_IN_MB, MAX_VIDEO_SIZE_MB } from "../../constants";
import Upload from "../../entities/Upload";
import useCreateUpload from "../../hooks/useCreateUpload";

const ACCEPTED_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/mpeg": ".mpeg",
    "video/3gpp": ".3gp",
    "video/x-msvideo": ".avi",
};

const schema = z.object({
    file: z
        .instanceof(File)
        .refine(
            (file: File) => file.size <= MAX_VIDEO_SIZE_MB * BYTES_IN_MB,
            `Max video size is ${MAX_VIDEO_SIZE_MB}MB`
        )
        .refine(
            (file: File) => file.type in ACCEPTED_VIDEO_TYPES,
            "This file format is not supported. Supported formats: " +
                Object.values(ACCEPTED_VIDEO_TYPES).join(", ")
        ),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onSubmit: () => void;
    onUploadProgress: (percentCompleted: number) => void;
    onUploadCreated: (upload: Upload) => void;
    isDisabled: boolean;
}

function UploadForm({
    onSubmit,
    onUploadProgress,
    onUploadCreated,
    isDisabled,
}: Props) {
    const {
        setError,
        setValue,
        formState: { isValid, isValidating, errors },
        control,
        trigger,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
        shouldUnregister: false,
    });

    const file = useWatch({ name: "file", control });

    useEffect(() => {
        if (isValidating || !isValid) return;
        onSubmit();
        createUpload.mutate(
            { file },
            { onSuccess: (upload) => onUploadCreated(upload) }
        );
    }, [file, isValidating]);

    const createUpload = useCreateUpload({
        onError: (data) => {
            if (data.file) setError("file", { message: data.file.join(" ") });
        },
        onUploadProgress,
    });

    if (createUpload.error) throw createUpload.error;

    return (
        <form style={{ height: "100%" }}>
            <FileUploader
                hoverTitle=" "
                handleChange={(file: File) => {
                    setValue("file", file);
                    trigger("file");
                }}
                disabled={isDisabled}
            >
                <FormControl
                    display="flex"
                    width="100%"
                    height="100%"
                    borderRadius={6}
                    justifyContent="center"
                    alignItems="center"
                    isInvalid={!!errors.file}
                >
                    <VStack spacing={6}>
                        <VStack>
                            <Icon as={AiOutlineUpload} boxSize={16} />
                            <Text>Drag and drop video file to upload</Text>
                            {errors.file && (
                                <FormErrorMessage fontSize="sm">
                                    {errors.file.message}
                                </FormErrorMessage>
                            )}
                        </VStack>
                        <Button isDisabled={isDisabled}>Select files</Button>
                    </VStack>
                </FormControl>
            </FileUploader>
        </form>
    );
}

export default UploadForm;

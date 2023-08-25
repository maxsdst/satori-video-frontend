import { useEffect } from "react";
import Video from "../../entities/Video";
import usePollUpload from "../../hooks/usePollUpload";
import ProgressBar from "../ProgressBar";

interface Props {
    uploadId: number;
    onUploadProcessed: (video: Video) => void;
}

function ProcessingBar({ uploadId, onUploadProcessed }: Props) {
    const { isDone, video, error } = usePollUpload(uploadId);

    useEffect(() => {
        if (isDone) onUploadProcessed(video!);
    }, [isDone]);

    if (error) throw error;

    return <ProgressBar label="Processing..." isIndeterminate={true} />;
}

export default ProcessingBar;

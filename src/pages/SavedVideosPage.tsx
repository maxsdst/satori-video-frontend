import MainContentArea from "../components/MainContentArea";
import SavedVideos from "../components/SavedVideos";
import useTitle from "../hooks/useTitle";

function SavedVideosPage() {
    useTitle("Saved videos");

    return (
        <MainContentArea isContentCentered={false}>
            <SavedVideos />
        </MainContentArea>
    );
}

export default SavedVideosPage;

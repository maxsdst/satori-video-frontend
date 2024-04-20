import MainContentArea from "../components/MainContentArea";
import SavedVideos from "../components/SavedVideos";

function SavedVideosPage() {
    return (
        <MainContentArea isContentCentered={false}>
            <SavedVideos />
        </MainContentArea>
    );
}

export default SavedVideosPage;

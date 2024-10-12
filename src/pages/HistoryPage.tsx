import History from "../components/History";
import MainContentArea from "../components/MainContentArea";
import useTitle from "../hooks/useTitle";

function HistoryPage() {
    useTitle("Watch history");

    return (
        <MainContentArea isContentCentered={false}>
            <History />
        </MainContentArea>
    );
}

export default HistoryPage;

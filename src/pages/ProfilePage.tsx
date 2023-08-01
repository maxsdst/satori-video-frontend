import { Spinner, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import MainContentArea from "../components/MainContentArea";
import Profile from "../components/Profile";
import UserVideosSection from "../components/UserVideosSection";
import useProfile from "../hooks/useProfile";

function ProfilePage() {
    const { username } = useParams();

    const { data: profile, isLoading, error } = useProfile(username!);
    if (isLoading) return <Spinner />;
    if (error) throw error;

    return (
        <MainContentArea isContentCentered={false}>
            <VStack alignItems="start" width="100%" spacing={6}>
                <Profile profile={profile} />
                <UserVideosSection profileId={profile.id} />
            </VStack>
        </MainContentArea>
    );
}

export default ProfilePage;

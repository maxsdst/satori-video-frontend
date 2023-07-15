import { VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import Profile from "../components/Profile";
import UserVideosSection from "../components/UserVideosSection";

function ProfilePage() {
    const { username } = useParams();

    return (
        <VStack alignItems="start" width="100%" spacing={6}>
            <Profile username={username!} />
            <UserVideosSection />
        </VStack>
    );
}

export default ProfilePage;

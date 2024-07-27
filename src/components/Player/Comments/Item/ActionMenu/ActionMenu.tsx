import {
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineFlag } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import Comment from "../../../../../entities/Comment";
import useOwnProfile from "../../../../../hooks/profiles/useOwnProfile";
import DeleteCommentDialog from "./DeleteCommentDialog";
import ReportModal from "./ReportModal";

interface Props {
    comment: Comment;
    onEdit: () => void;
    onDeleted: () => void;
}

function ActionMenu({ comment, onEdit, onDeleted }: Props) {
    const { data: ownProfile, isLoading, error } = useOwnProfile();

    const {
        isOpen: isDeleteCommentDialogOpen,
        onOpen: openDeleteCommentDialog,
        onClose: closeDeleteCommentDialog,
    } = useDisclosure();

    const {
        isOpen: isReportModalOpen,
        onOpen: openReportModal,
        onClose: closeReportModal,
    } = useDisclosure();

    if (isLoading || error) return null;

    return (
        <>
            <Menu>
                <MenuButton
                    as={IconButton}
                    icon={<Icon as={BsThreeDotsVertical} boxSize={5} />}
                    variant="ghost"
                    size="sm"
                    borderRadius="50%"
                    padding={0}
                    aria-label="Action menu"
                />
                {comment.profile.id === ownProfile?.id && (
                    <MenuList aria-label="Actions">
                        <MenuItem
                            icon={
                                <Icon
                                    as={AiOutlineEdit}
                                    boxSize={5}
                                    onClick={onEdit}
                                />
                            }
                            onClick={onEdit}
                        >
                            Edit
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={AiOutlineDelete} boxSize={5} />}
                            onClick={openDeleteCommentDialog}
                        >
                            Delete
                        </MenuItem>
                    </MenuList>
                )}
                {comment.profile.id !== ownProfile?.id && (
                    <MenuList aria-label="Actions">
                        <MenuItem
                            icon={<Icon as={AiOutlineFlag} boxSize={5} />}
                            onClick={openReportModal}
                        >
                            Report
                        </MenuItem>
                    </MenuList>
                )}
            </Menu>
            <DeleteCommentDialog
                comment={comment}
                isOpen={isDeleteCommentDialogOpen}
                onClose={closeDeleteCommentDialog}
                onDeleted={onDeleted}
            />
            <ReportModal
                comment={comment}
                isOpen={isReportModalOpen}
                onClose={closeReportModal}
            />
        </>
    );
}

export default ActionMenu;

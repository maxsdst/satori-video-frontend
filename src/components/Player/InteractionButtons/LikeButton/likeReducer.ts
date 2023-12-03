interface LikeState {
    isLiked: boolean;
    likeCount: number;
}

interface CreateLikeAction {
    type: "CREATE_LIKE";
}

interface RemoveLikeAction {
    type: "REMOVE_LIKE";
}

interface UpdateStateAction {
    type: "UPDATE_STATE";
    state: LikeState;
}

type Action = CreateLikeAction | RemoveLikeAction | UpdateStateAction;

function likeReducer(state: LikeState, action: Action): LikeState {
    switch (action.type) {
        case "CREATE_LIKE":
            return {
                ...state,
                isLiked: true,
                likeCount: state.likeCount + 1,
            };

        case "REMOVE_LIKE":
            return {
                ...state,
                isLiked: false,
                likeCount: state.likeCount - 1,
            };

        case "UPDATE_STATE":
            return action.state;
    }

    return state;
}

export default likeReducer;

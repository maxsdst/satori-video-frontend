interface PlayerState {
    isPlaying: boolean;
    isMuted: boolean;
    areCommentsOpen: boolean;
    isDescriptionOpen: boolean;
    isContentExpanded: boolean;
}

interface Action {
    type:
        | "PLAY"
        | "PAUSE"
        | "MUTE"
        | "UNMUTE"
        | "OPEN_COMMENTS"
        | "OPEN_DESCRIPTION"
        | "COLLAPSE_CONTENT";
}

function playerReducer(state: PlayerState, action: Action): PlayerState {
    switch (action.type) {
        case "PLAY":
            return { ...state, isPlaying: true };

        case "PAUSE":
            return { ...state, isPlaying: false };

        case "MUTE":
            return { ...state, isMuted: true };

        case "UNMUTE":
            return { ...state, isMuted: false };

        case "OPEN_COMMENTS":
            return {
                ...state,
                areCommentsOpen: true,
                isDescriptionOpen: false,
                isContentExpanded: true,
            };

        case "OPEN_DESCRIPTION":
            return {
                ...state,
                isDescriptionOpen: true,
                areCommentsOpen: false,
                isContentExpanded: true,
            };

        case "COLLAPSE_CONTENT":
            return {
                ...state,
                areCommentsOpen: false,
                isDescriptionOpen: false,
                isContentExpanded: false,
            };
    }
}

export default playerReducer;

export default {
    name: 'choodleWithFriendsCopy',
    type: 'document',
    title: 'Choodle With Friends Copy',
    fields: [
        {
            name: 'startGameButtonText',
            type: 'string',
            title: 'Start Game Button Text',
        },
        {
            name: 'pick_promptSelectionPageTopContent',
            title: 'Prompt Selection Page Top Content',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'pick_shuffleButtonText',
            type: 'string',
            title: 'Prompt Selection Page Shuffle Button Text',
        },
        {
            name: 'pick_doneButtonText',
            type: 'string',
            title: 'Prompt Selection Page Done Button Text',
        },
        {
            name: 'draw_topBarInstructionText',
            title: 'Draw Page Top Bar Instruction',
            type: 'string',
        },
        {
            name: 'draw_undoButtonText',
            title: 'Draw Page Undo Button Text',
            type: 'string',
        },
        {
            name: 'draw_doneButtonText',
            title: 'Draw Page Done Button Text',
            type: 'string',
        },
        {
            name: 'share_messageText',
            title: 'Share Page Message Text',
            type: 'string',
        },
        {
            name: 'guess_pageTopContent',
            title: 'Guess Page Top Content',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'guess_doneButtonText',
            title: 'Guess Page Done Button Text',
            type: 'string',
        },
        {
            name: 'guess_failureMessageText',
            title: 'Guess Page Failure Message Text',
            type: 'string',
        },
        {
            name: 'guess_failureNewGameButtonText',
            title: 'Guess Page New Game Button Text',
            type: 'string',
        },
        {
            name: 'success_topContent',
            title: 'Success Page New Game Button Text',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'success_continueGameButtonText',
            title: 'Success Page Continue Button Text',
            type: 'string',
        },
        {
            name: 'success_leaderboardButtonText',
            title: 'Success Page Leaderboard Button Text',
            type: 'string',
        },
    ]
}

export default {
  name: "choodleWithFriendsCopy",
  type: "document",
  title: "Site Copy",
  fields: [
    {
      name: "defaultPageTitle",
      type: "string",
      title:
        "The default page title for pages in the game; this shows up on the share card.",
    },
    {
      name: "logo",
      type: "image",
      title: "Logo",
    },
    {
      name: "logoLinkDestination",
      type: "string",
      title: "Where clicking the logo takes the user.",
    },
    {
      name: "landing_content",
      title: "Content for the landing page",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "landing_content_first_time",
      title: "Content for first time users on the landing page",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "landing_image",
      title: "Image or video for the landing page",
      type: "file",
    },
    {
      name: "landing_content_bottom",
      title: "Content for the landing page below the button",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "rules_content",
      title: "Rules of the Game",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "gameListUserUnknownText",
      type: "string",
      title: "Placeholder text for a player with unknown username",
    },
    {
      name: "startGameButtonText",
      type: "string",
      title: "Start Game Button Text",
    },
    {
      name: "pick_promptSelectionPageTopContent",
      title: "Prompt Pick Page Top Content",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "pick_promptSelectionPageMiddleContent",
      title: "Prompt Pick Page Middle Content",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "pick_shuffleButtonText",
      type: "string",
      title: "Prompt Pick Page Shuffle Button Text",
    },
    {
      name: "pick_doneButtonText",
      type: "string",
      title: "Prompt Pick Page Done Button Text",
    },
    {
      name: "draw_instruction",
      title: "Draw Page Overlay Instruction",
      type: "string",
    },
    {
      name: "draw_topBarInstructionText",
      title: "Draw Page Top Bar Instruction",
      type: "string",
    },
    {
      name: "draw_undoButtonText",
      title: "Draw Page Undo Button Text",
      type: "string",
    },
    {
      name: "draw_doneButtonText",
      title: "Draw Page Done Button Text",
      type: "string",
    },
    {
      name: "draw_usernameHeader",
      title: "Header of the Username entry page",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "draw_usernamePlaceholder",
      title: "Placeholder text for username entry input",
      type: "string",
    },
    {
      name: "draw_usernameSaveButtonText",
      title: "Save username Button Text",
      type: "string",
    },
    {
      name: "share_messageText",
      title: "Share Page Message Text",
      type: "string",
    },
    {
      name: "share_buttonText",
      title: "Share Page Button Text",
      type: "string",
    },
    {
      name: "guess_pageAuthorTopContent",
      title: "Challenge Share Page Top Content For Author",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "guess_pageTopContent",
      title: "Guess Page Top Content for Guessing",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "guess_pageTopContentSuccess",
      title: "Guess Page Top Content for Success",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "guess_pageTopContentFailure",
      title: "Guess Page Top Content for Failure",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "guess_doneButtonText",
      title: "Guess Page Done Button Text",
      type: "string",
    },
    {
      name: "guess_shareButtonTextSuccess",
      title: "Guess Page Share Button Text for Success",
      type: "string",
    },
    {
      name: "guess_shareButtonTextFailure",
      title: "Guess Page Share Button Text for Failure",
      type: "string",
    },
    {
      name: "guess_copiedToClipboard",
      title: "Guess Page Copied to Clipboard Text",
      type: "string",
    },
    {
      name: "guess_needHintCtaText",
      title: "CTA for using hints",
      type: "string",
    },
    {
      name: "guess_incorrectFeedbackText",
      title: "Guess Page Incorrect Guess Feedback Text",
      type: "string",
    },
    {
      name: "guess_successMessageText",
      title: "Guess Page Success Message Text",
      type: "string",
    },
    {
      name: "guess_failureMessageText",
      title: "Guess Page Failure Message Text",
      type: "string",
    },
    {
      name: "guess_failureNewGameButtonText",
      title: "Guess Page New Game Button Text",
      type: "string",
    },
    {
      name: "success_continueGameButtonText",
      title: "Success Page Continue Button Text",
      type: "string",
    },
    {
      name: "success_leaderboardButtonText",
      title: "Success Page Leaderboard Button Text",
      type: "string",
    },
    {
      name: "loadingMessage1",
      title: "Loading Message 1",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "loadingMessage2",
      title: "Loading Message 2",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "loadingMessage3",
      title: "Loading Message 3",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "loadingMessage4",
      title: "Loading Message 4",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "loadingMessage5",
      title: "Loading Message 5",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "auth_loginButtonText",
      title: "Login button text",
      type: "string",
    },
    {
      name: "auth_logoutButtonText",
      title: "Logout button text",
      type: "string",
    },
    {
      name: "auth_registerButtonText",
      title: "Register account button text",
      type: "string",
    },
    {
      name: "auth_changeAccountButtonText",
      title: "Change account button text",
      type: "string",
    },
  ],
};

/*
game:
 - sanity's id
 - pic
 - creatorId (creator of the drawing _and_ the game)
 - belongs_to choodleId, which is the prompt and the drawing
 - player
    - guesses (capture every guess)
        - guess belongs to both the game and the choodle

when we share, we share by gameId (sanity's id)

only two people play one game
the game doesn't get created until the first guess (or a pending game)

 */
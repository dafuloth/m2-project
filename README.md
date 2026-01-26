# Milestone 2 Project: Noughts & Crosses game

This project implements the game of Noughts & Crosses (a.k.a. Tic-Tac-Toe) in HTML, CSS, and JavaScript.

### Target Users & User Stories

I am creating this game for anyone with a few minutes to spare, looking for a quick mental break.

*   "As a commuter, I want the game to load instantly and work smoothly on my phone so that I can enjoy a quick round during short travel breaks."
*   "As a competitive friend, I want my match history to persist even after closing the browser so that we can track our multi-day gaming sessions."
*   "As a user with color vision deficiency, I want the marks (X and O) to have high-contrast, distinct colors so that I can easily play the game without confusion."
*   "As a user who switches between phone and laptop, I want to have a great experience no matter which device I am using."


## Design

### Wireframes



### Colour scheme & Accessibility

Colour scheme has been selected with accessibility in mind. For example, player colours were initially red and green but that could have made the game difficult to play for people with colour blindness (Deuteranopia). 

Therefore, I have opted for the following orange and blue, which have better contrast for players with colour blindness:

- **Player X**: Vivid Orange (`#fb923c`) 
- **Player O**: Ice Blue (`#7dd3fc`)

### Mobile-First Responsive Design Features

The game is designed to be fully responsive and work well for all screens sizes starting from narrow 320px mobile screens all the way up to large desktop monitors:

* main container has a max-width of 450px, but on smaller screens is able to automatically shrink to fit
* 25cqw: CQW Units (Container Query Width) units are used for the cell font size of the players X and O to ensure they are always 25% of the width of the board container.
* Cells aspect ratio: `aspect-ratio: 1` ensures the cells stay perfectly square whether the screen is narrow or wide.
* 768px breakpoint: On screens wider than 768px, the main container padding is increased from 24px to 48px in order to make better use of the extra screen space.


### Name of the game

I am calling it Noughts & Crosses, because I'm British and that's what we call it. Perhaps you may know it better as Tic-Tac-Toe.

## Features

### Fully responsive web app

The app is designed to be fully responsive and work well for all screen sizes starting from narrow 320px mobile screens all the way up to large desktop monitors.

### Personalized Player Names

On initial load, the user has the option to enter player names for X and O. If they do not enter names, the game will default to "X" and "O". The names are stored in local storage and will be remembered for the duration of the session.

### Sound Effects

Sound effects have been added in order to provide feedback to the players:

- Cell hover: A click sound is played when the user hovers over a cell.
- Player move: A sound effect is played when a player makes a move. The sound effect is different for each player.
- Game win: A applause sound is played when a player wins the game.

A mute button is provided to toggle sound effects on and off as preferred.

### Scoreboard

The scoreboard tracks game history. It records the date and time of each game and the result. The scoreboard is updated every time a game is played. The data is persists via the browser's local storage. The user can manually clear the scoreboard via the Clear History button, which will only be visible if there are results to clear, i.e. it is initially hidden.

To avoid the scoreboard section extending forever, its maximum height is restricted to fit 1 screenful. If there are more results than can be shown, a scrollbar appears to allow the user to scroll through the results.

### 404 Page

When the user navigates to a page that does not exist, a 404 page is displayed. It is a custom 404 page with the same styling as the rest of the app.

# Acceptance Criteria


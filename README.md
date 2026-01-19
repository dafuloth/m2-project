# Milestone 2 Project: Tic-Tac-Toe game

This project implements the game of Tic-Tac-Toe (Noughts & Crosses) in HTML, CSS, and JavaScript.

## Design Decisions

### Colour scheme & Accessibility

Colour scheme has been selected with accessibility in mind. For example, player colours were initially red and green but that could have made the game difficult to play for people with colour blindness (Deuteranopia). 

Therefore, I have opted for the following colours, which have better contrast for players with colour blindness:

- **Player X**: Vivid Orange (`#fb923c`) 
- **Player O**: Ice Blue (`#7dd3fc`) 

### Mobile-First Responsive Design Features

The game is designed to be fully responsive and work well for all screens sizes starting from narrow 320px mobile screens all the way up to large desktop monitors:

* main container has a max-width of 450px, but on smaller screens is able to automatically shrink to fit
* 25cqw: CQW Units (Container Query Width) units are used for the cell font size of the players X and O to ensure they are always 25% of the width of the board container.
* Cells aspect ratio: `aspect-ratio: 1` ensures the cells stay perfectly square whether the screen is narrow or wide.
* 768px breakpoint: On screens wider than 768px, the main container padding is increased from 24px to 48px in order to make better use of the extra screen space.


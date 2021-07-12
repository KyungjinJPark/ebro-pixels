# EBros Pixels 👾

A lil pixel canvas for the eBros. Built on Go just because.

## The Jira 📋

### The Todo

- Implement Client-and-Server-side validation
- Make basic infrastructure scalable (prob a lot to write for this)
- Make it multiplayer
- parallel computing
  - Allow line drawing
  - Allow triangle drawing (|| computing)
  - sends pixel data to channels

### The Done ✅

- Create Go web server
- Serve index.html
- Serve static css and js
- Display grid on webpage properly
- Load grid info from JSON and serve
- Allow clicking on pixels to toggle color
  - Save chages to JSON
- Fetch grid data w/o refresh
- Allow all 255^3 colors of RGB
  - Create ~~color picker~~ palette
  - Create a set of image pixels users can draw (emoji pixels)
- Allow "click and drag" drawing

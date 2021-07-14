# EBros Pixels 👾

A lil pixel canvas for the eBros. Built on Go just because.

## The Jira 📋

### The Todo

- parallel computing
  - Allow line drawing ✅
  - Optimize line drawing
  - Allow triangle drawing (|| computing)
    - Write algorithm to send pixel data to channels
  - Create seperate package from drawing algorithms ✅
    - Removed webserver.exe. Use "go install . && pixels-for-friends.exe" to build and run ✅
- Color picker

### Known Issues 🦗

- Any mouse click will draw https://stackoverflow.com/questions/322378/javascript-check-if-mouse-button-down
- If you draw too fast:
  - data/grid.json gets corrupted
  - "Error saving grid data: unexpected end of JSON input ON loadGridData"
- App slows down over time

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
- Implement Client-and-Server-side validation
- Make basic infrastructure scalable (wasn't that much maybe b/c I look too closely)
- Make it multiplayer

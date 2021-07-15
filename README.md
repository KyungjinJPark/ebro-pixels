# Ebro Pixels 👾

A lil pixel canvas for the 'eBro's. Built on Go just because.

## The Jira 📋

### The Todo

- n😅thing

### Known Issues 🦗

- Any mouse click will draw https://stackoverflow.com/questions/322378/javascript-check-if-mouse-button-down
- If you draw too fast:
  - data/grid.json gets corrupted
  - "Error saving grid data: unexpected end of JSON input ON Unmarshal ON loadGridData"
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
- Allow Line Drawing
  - Optimize line drawing++
  - Create seperate package from drawing algorithms
    - Note: Use "go install . && ebro-pixels.exe" to build and run
- Allow triangle drawing
  - Implement a parallel computing solution that uses channels
- Indicate where selected pixels are
- Create a eyedropper tool

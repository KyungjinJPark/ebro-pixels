// Grid code
const renderPixel = (pidiv, [r, g, b]) => {
  if (r >= 0) {
    pidiv.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    pidiv.style.backgroundImage = `none`;
  } else {
    pidiv.style.backgroundImage = `url("/static/emojis/${emojiDict[g]}.png")`;
  }
};

// TODO: This is a stopgag solution for Color Picker
var globalPixels = undefined;

const updateGrid = (pixels) => {
  // TODO: This is a stopgag solution for Color Picker
  globalPixels = pixels;
  let gridDiv = document.getElementsByClassName("pixel-grid")[0];
  pixels.forEach((pi, i) => {
    renderPixel(gridDiv.childNodes[i], pi);
  });
};

const getGrid = () => {
  const Http = new XMLHttpRequest();
  const url = "/get/";
  Http.open("GET", url);
  Http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // IDK what this 4 is...
      let newGridData = JSON.parse(this.responseText);
      updateGrid(newGridData.Pixels);
    }
  };
  Http.send();
};

var isDragging = false;
var selected = [null, null];

const setUpGrid = (width, height, pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid")[0];
  const cellSize = 1.75;
  gridDiv.style.width = width * cellSize + "em";
  gridDiv.style.height = height * cellSize + "em";

  // Click and drag drawing code
  const dragEnable = (event) => {
    // Make sure the M1 (button 0) is the button being pressed
    if (event.button === 0) {
      isDragging = true;
    }
  };
  const dragDisable = (event) => {
    if (event.button === 0) {
      isDragging = false;
    }
  };
  gridDiv.addEventListener("mousedown", dragEnable);
  document.addEventListener("mouseup", dragDisable);
  document.addEventListener("dragstart", dragDisable);
  document.addEventListener("mouseleave", dragDisable);

  pixels.forEach((pi, i) => {
    let pixelDiv = document.createElement("div");
    pixelDiv.className = "pixel";
    pixelDiv.style.width = cellSize + "em";
    pixelDiv.style.height = cellSize + "em";
    renderPixel(pixelDiv, pi);

    // On change color (server request)
    const draw = () => {
      const Http = new XMLHttpRequest();
      const url = "/edit/";
      Http.open("POST", url, true);
      Http.setRequestHeader("Content-Type", "application/json");
      Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          // IDK what this 4 is...
          let newGrid = JSON.parse(this.responseText);
          updateGrid(newGrid.Pixels);
        }
      };
      let data = {
        Tool: currColor.tool,
        PixelIds: [i],
        RgbCode: currColor.rgbCode,
      };
      Http.send(JSON.stringify(data));
    };

    // TODO: this seems really not scalable...
    const select = () => {
      if (selected[0] === null) {
        selected[0] = i;
        gridDiv.childNodes[i].classList.add("breathing");
      } else if (currColor.tool === "line") {
        const Http = new XMLHttpRequest();
        const url = "/edit/";
        Http.open("POST", url, true);
        Http.setRequestHeader("Content-Type", "application/json");
        Http.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            // IDK what this 4 is...
            let newGrid = JSON.parse(this.responseText);
            updateGrid(newGrid.Pixels);
          }
        };
        let data = {
          Tool: currColor.tool,
          PixelIds: [selected[0], i],
          RgbCode: currColor.rgbCode,
        };
        Http.send(JSON.stringify(data));

        if (selected[0] != null) {
          gridDiv.childNodes[selected[0]].classList.remove("breathing");
          selected[0] = null;
        }
        if (selected[1] != null) {
          gridDiv.childNodes[selected[1]].classList.remove("breathing");
          selected[1] = null;
        }
      } else if (selected[1] === null) {
        selected[1] = i;
        gridDiv.childNodes[i].classList.add("breathing");
      } else {
        const Http = new XMLHttpRequest();
        const url = "/edit/";
        Http.open("POST", url, true);
        Http.setRequestHeader("Content-Type", "application/json");
        Http.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            // IDK what this 4 is...
            let newGrid = JSON.parse(this.responseText);
            updateGrid(newGrid.Pixels);
          }
        };
        let data = {
          Tool: currColor.tool,
          PixelIds: [selected[0], selected[1], i],
          RgbCode: currColor.rgbCode,
        };
        Http.send(JSON.stringify(data));

        if (selected[0] != null) {
          gridDiv.childNodes[selected[0]].classList.remove("breathing");
          selected[0] = null;
        }
        if (selected[1] != null) {
          gridDiv.childNodes[selected[1]].classList.remove("breathing");
          selected[1] = null;
        }
      }
    };

    // TODO: the workaround to get this working is kinda jank
    const pickColor = () => {
      // currColor.tool = "point";
      if (globalPixels[i][0] != -1) {
        currColor.rgbFake = globalPixels[i];
      }
      currColor.rgbCode = globalPixels[i];
      updatePreview();
    };

    pixelDiv.onmousedown = (event) => {
      // Make sure the M1 (button 0) is the button being pressed
      if (event.button !== 0) {
        return;
      }
      switch (currColor.tool) {
        case "point":
          draw();
          break;
        case "line":
          select();
          break;
        case "triangle":
          select();
          break;
        case "color-picker":
          pickColor();
          break;
        default:
          console.log("what the heck u do");
          break;
      }
    };
    pixelDiv.onmouseover = (event) => {
      switch (currColor.tool) {
        case "point":
          if (isDragging) {
            draw();
          }
          break;
        case "line":
          break;
        case "triangle":
          break;
        case "color-picker":
          break;
        default:
          console.log("what the heck u do");
          break;
      }
    };

    // Make pixels un-right-click-able
    pixelDiv.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    gridDiv.appendChild(pixelDiv);
  });

  setInterval(() => {
    getGrid();
  }, 100);
};

// Pallete code
var currColor = {
  rgbCode: [255, 0, 0],
  rgbFake: [255, 0, 0],
  tool: "point",
};

const emojiDict = [
  "beter_LUL",
  "alex_tired",
  "beter_finds_spring",
  "myana",
  "thomas_finna_diequik",
];

const updatePreview = () => {
  const prev = document.getElementsByClassName("preview")[0];
  renderPixel(prev, currColor.rgbCode);
  prev.textContent = currColor.tool;
};

const parseRgbInput = (event) => {
  let input = parseInt(event.target.value);
  if (input >= 0 && input <= 255) {
    // do nothing
  } else if (input > 255) {
    input = 255;
  } else {
    input = 0;
  }
  return input;
};

const setUpPalette = () => {
  // Initialize preview
  updatePreview();
  // Initialize RGB controller
  ["r", "g", "b"].forEach((letter, i) => {
    document
      .getElementById(`color-${letter}`)
      .addEventListener("input", (event) => {
        let newVal = parseRgbInput(event);
        currColor.rgbFake[i] = newVal;
        event.target.value = newVal;
        currColor.rgbCode = currColor.rgbFake;
        updatePreview();
      });
  });
  // Initialize color buttons
  document.getElementById("color-button").addEventListener("click", (event) => {
    currColor.rgbCode = currColor.rgbFake;
    updatePreview();
  });
  // Initialize emoji buttons
  let controls = document.getElementsByClassName("controls")[0];
  emojiDict.forEach((emojiName, i) => {
    let emojiButton = document.createElement("button");
    emojiButton.id = `emoji${i}-button`;
    emojiButton.textContent = emojiName;
    emojiButton.addEventListener("click", (event) => {
      currColor.rgbCode = [-1, i, 0];
      updatePreview();
    });
    controls.appendChild(emojiButton);
  });
  controls.appendChild(document.createElement("br"));
  // Initialize tool buttons
  ["point", "line", "triangle", "color-picker"].forEach((toolName) => {
    let toolButton = document.createElement("button");
    toolButton.id = `${toolName}-button`;
    toolButton.textContent = `draw ${toolName}`;
    toolButton.addEventListener("click", (event) => {
      currColor.tool = toolName;
      updatePreview();
    });
    controls.appendChild(toolButton);
  });
};

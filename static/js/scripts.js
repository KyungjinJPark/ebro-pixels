// Grid code
const renderPixel = (pidiv, [r, g, b]) => {
  if (r >= 0) {
    pidiv.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    pidiv.style.backgroundImage = `none`;
  } else {
    pidiv.style.backgroundImage = `url("/static/emojis/${emojiDict[g]}.png")`;
  }
};

const updateGrid = (pixels) => {
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
var selected = null;

const setUpGrid = (width, height, pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid")[0];
  const cellSize = 1.75;
  gridDiv.style.width = width * cellSize + "em";
  gridDiv.style.height = height * cellSize + "em";

  // Click and drag drawing code
  const dragEnable = () => {
    isDragging = true;
  };
  gridDiv.addEventListener("mousedown", dragEnable);
  const dragDisable = () => {
    isDragging = false;
  };
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

    const select = () => {
      if (selected === null) {
        selected = i;
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
          PixelIds: [selected, i],
          RgbCode: currColor.rgbCode,
        };
        Http.send(JSON.stringify(data));

        selected = null;
      }
    };

    pixelDiv.onmousedown = () => {
      switch (currColor.tool) {
        case "point":
          draw();
          break;
        case "line":
          select();
          break;
        default:
          console.log("what the heck u do");
          break;
      }
    };
    pixelDiv.onmouseover = () => {
      switch (currColor.tool) {
        case "point":
          if (isDragging) {
            draw();
          }
          break;
        case "line":
          break;
        default:
          console.log("what the heck u do");
          break;
      }
    };

    // Click and drag drawing code quirks
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
  renderPixel(document.getElementsByClassName("preview")[0], currColor.rgbCode);
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
  // Initialize buttons
  document.getElementById("color-button").addEventListener("click", (event) => {
    currColor.rgbCode = currColor.rgbFake;
    currColor.tool = "point";
    updatePreview();
  });
  document.getElementById("line-button").addEventListener("click", (event) => {
    currColor.rgbCode = currColor.rgbFake;
    currColor.tool = "line";
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
      currColor.tool = "point";
      updatePreview();
    });
    controls.appendChild(emojiButton);
  });
};

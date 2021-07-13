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

const setUpGrid = (width, height, pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid")[0];
  gridDiv.style.width = width * 2 + "em";
  gridDiv.style.height = height * 2 + "em";

  // Click and drag drawing code
  var isDragging = false;
  gridDiv.addEventListener("mousedown", () => {
    isDragging = true;
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
  document.addEventListener("dragstart", () => {
    isDragging = false;
  });
  document.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  pixels.forEach((pi, i) => {
    let pixelDiv = document.createElement("div");
    pixelDiv.className = "pixel";
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
        PixelId: i,
        RgbCode: currColor.rgbCode,
      };
      Http.send(JSON.stringify(data));
    };

    pixelDiv.onmousedown = () => {
      draw();
    };
    pixelDiv.onmouseover = () => {
      if (isDragging) {
        draw();
      }
    };

    // Click and drag drawing code quirks
    pixelDiv.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    gridDiv.appendChild(pixelDiv);
  });
};

// Pallete code
var currColor = {
  rgbCode: [255, 0, 0],
  rgbFake: [255, 0, 0],
};

// TODO: this is not scalable, probably
const emojiDict = ["beter_LUL", "alex_tired"];

const updatePreview = () => {
  // TODO: this logic is repeated
  const [r, g, b] = currColor.rgbCode;
  if (r >= 0) {
    document.getElementsByClassName(
      "preview"
    )[0].style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    document.getElementsByClassName("preview")[0].style.backgroundImage =
      "none";
  } else {
    document.getElementsByClassName(
      "preview"
    )[0].style.backgroundImage = `url("/static/emojis/${emojiDict[g]}.png")`;
  }
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

// TODO: this is not scalable, probably
const setUpPalette = () => {
  updatePreview();
  ["r", "g", "b"].forEach((letter, i) => {
    document
      .getElementById(`color-${letter}`)
      .addEventListener("input", (event) => {
        currColor.rgbFake[i] = parseRgbInput(event);
        event.target.value = parseRgbInput(event);
        currColor.rgbCode = currColor.rgbFake;
        updatePreview();
      });
  });
  document.getElementById("color-button").addEventListener("click", (event) => {
    currColor.rgbCode = currColor.rgbFake;
    updatePreview();
  });
  document
    .getElementById("emoji0-button")
    .addEventListener("click", (event) => {
      currColor.rgbCode = [-1, 0, 0];
      updatePreview();
    });
  document
    .getElementById("emoji1-button")
    .addEventListener("click", (event) => {
      currColor.rgbCode = [-1, 1, 0];
      updatePreview();
    });
};

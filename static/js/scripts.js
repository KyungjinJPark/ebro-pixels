// Grid code
const setUpGrid = (width, height, pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid")[0];
  gridDiv.style.width = width * 2 + "em";
  gridDiv.style.height = height * 2 + "em";

  // Click and drag drawing code
  var isDragging = false;
  gridDiv.addEventListener("mousedown", () => {
    isDragging = true;
  });
  gridDiv.addEventListener("mouseup", () => {
    isDragging = false;
  });
  gridDiv.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  pixels.forEach((pi, i) => {
    let pixelDiv = document.createElement("div");
    pixelDiv.className = "pixel";

    // TODO: this logic is repeated
    const [r, g, b] = pi;
    if (r >= 0) {
      pixelDiv.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      pixelDiv.style.backgroundImage = `none`;
    } else {
      pixelDiv.style.backgroundImage = `url("/static/emojis/${emojiDict[g]}.png")`;
    }

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
      console.log("should be printing");
      draw();
    };
    pixelDiv.onmouseover = () => {
      pixelDiv.style.transform = "scale(1.1)";
      pixelDiv.style.zIndex = "100";
      if (isDragging) {
        console.log("should be printing");
        draw();
      }
    };
    pixelDiv.onmouseout = () => {
      pixelDiv.style.transform = "scale(1)";
      pixelDiv.style.zIndex = "10";
    };
    pixelDiv.style.transform = "scale(1)";
    pixelDiv.style.zIndex = "10";

    gridDiv.appendChild(pixelDiv);
  });
};

const updateGrid = (pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid")[0];
  // TODO: this logic is repeated
  pixels.forEach((pi, i) => {
    const [r, g, b] = pi;
    if (r >= 0) {
      gridDiv.childNodes[i].style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      gridDiv.childNodes[i].style.backgroundImage = `none`;
    } else {
      gridDiv.childNodes[
        i
      ].style.backgroundImage = `url("/static/emojis/${emojiDict[g]}.png")`;
    }
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

// TODO: this is not scalable, probably
const setUpPalette = () => {
  updatePreview();
  document.getElementById("color-r").addEventListener("input", (event) => {
    currColor.rgbFake[0] = parseInt(event.target.value);
    currColor.rgbCode = currColor.rgbFake;
    updatePreview();
  });
  document.getElementById("color-g").addEventListener("input", (event) => {
    currColor.rgbFake[1] = parseInt(event.target.value);
    currColor.rgbCode = currColor.rgbFake;
    updatePreview();
  });
  document.getElementById("color-b").addEventListener("input", (event) => {
    currColor.rgbFake[2] = parseInt(event.target.value);
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

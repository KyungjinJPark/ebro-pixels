const setUpGrid = (width, height, pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid");
  gridDiv[0].style.width = width * 2 + "em";
  gridDiv[0].style.height = height * 2 + "em";
  console.log("b4 forEach");
  pixels.forEach((pi) => {
    console.log("in forEach");
    let pixelDiv = document.createElement("div");
    pixelDiv.className = "pixel";
    if (pi === 1) {
      pixelDiv.style.backgroundColor = "#F00";
    } else {
      pixelDiv.style.backgroundColor = "#FFF";
    }
    gridDiv[0].appendChild(pixelDiv);
  });
};

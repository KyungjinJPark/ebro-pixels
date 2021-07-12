const setUpGrid = (width, height, pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid");
  gridDiv[0].style.width = width * 2 + "em";
  gridDiv[0].style.height = height * 2 + "em";
  pixels.forEach((pi, i) => {
    let pixelDiv = document.createElement("div");
    pixelDiv.className = "pixel";
    pixelDiv.style.backgroundColor = pi === 1 ? "#F00" : "#FFF";

    pixelDiv.onmouseenter = () => {
      pixelDiv.style.transform = "scale(1.1)";
      pixelDiv.style.zIndex = "100";
    };
    pixelDiv.onmouseout = () => {
      pixelDiv.style.transform = "scale(1)";
      pixelDiv.style.zIndex = "10";
    };
    pixelDiv.style.transform = "scale(1)";
    pixelDiv.style.zIndex = "10";

    // On change color (server request)
    pixelDiv.onclick = () => {
      const Http = new XMLHttpRequest();
      const url = "/edit/";
      Http.open("POST", url, true);
      Http.setRequestHeader("Content-Type", "application/json");
      Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          // IDK what this 4 is...
          let newGrid = JSON.parse(this.responseText);
          // TODO: response should contain new grid data!!!!!
          clearGrid();
          setUpGrid(newGrid.Width, newGrid.Height, newGrid.Pixels);
          // location.reload();
        }
      };
      let data = {
        PixelId: i,
      };
      Http.send(JSON.stringify(data));
    };

    gridDiv[0].appendChild(pixelDiv);
  });
};

const clearGrid = () => {
  let gridDiv = document.getElementsByClassName("pixel-grid");
  gridDiv[0].innerHTML = "";
};

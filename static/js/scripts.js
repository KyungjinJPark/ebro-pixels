const setUpGrid = (width, height, pixels) => {
  let gridDiv = document.getElementsByClassName("pixel-grid");
  gridDiv[0].style.width = width * 2 + "em";
  gridDiv[0].style.height = height * 2 + "em";
  pixels.forEach((pi, i) => {
    let pixelDiv = document.createElement("div");
    pixelDiv.className = "pixel";

    // Pixel color stuff
    let pixelColor = null;
    if (pi === 1) {
      pixelColor = "#F00";
    } else {
      pixelColor = "#FFF";
    }
    pixelDiv.style.backgroundColor = pixelColor;

    pixelDiv.onmouseenter = () => {
      pixelDiv.style.backgroundColor = "greenyellow";
    };
    pixelDiv.onmouseout = () => {
      pixelDiv.style.backgroundColor = pixelColor;
    };

    // On change color (server request)
    pixelDiv.onclick = () => {
      const Http = new XMLHttpRequest();
      const url = "/edit/";
      Http.open("POST", url, true);
      Http.setRequestHeader("Content-Type", "application/json");
      Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          // IDK what this 4 is...
          let resp = this.responseText;
          console.log("DEBUG:", resp);
          location.reload();
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

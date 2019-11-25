import _ from 'lodash';

export const downloadFish = (ocean, filename) => {
  const canvas = document.createElement('canvas');
  canvas.width = 310 * 10;
  canvas.height = 210 * 10;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  var i = 0;
  ocean.forEach(fish => {
    const fishCanvas = document.createElement('canvas');
    fishCanvas.width = 300;
    fishCanvas.height = 200;

    fish.drawToCanvas(fishCanvas);
    canvas
      .getContext('2d')
      .drawImage(fishCanvas, (i % 10) * 310, Math.floor(i / 10) * 210);
    i++;
  });
  var img = canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');
  var download = document.createElement('a');
  download.download = `${filename}.png`;
  download.href = img;
  download.click();
};

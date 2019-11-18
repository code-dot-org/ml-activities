import _ from 'lodash';

export const downloadFish = ocean => {
  /*ocean.forEach(fish => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    fish.drawToCanvas(canvas);
    var img = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    var download = document.createElement('a');
    download.download = `${fish.id}.png`;
    download.href = img;
    download.click();
  });*/
  const sets = _.chunk(ocean, 100);
  var f = 0;
  sets.forEach(set => {
    console.log(set.length);
    const canvas = document.createElement('canvas');
    canvas.width = 310 * 10;
    canvas.height = 210 * 10;
    canvas.getContext('2d').fillStyle = '#D9D9D9';
    canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);

    var i = 0;
    set.forEach(fish => {
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
    download.download = `${f}.png`;
    download.href = img;
    download.click();
    f++;
  });
};

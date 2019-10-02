import {COLORS} from '../colors';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const BG_COLOR = '#021a61';

const BODY_CENTER_X = CANVAS_WIDTH / 2;
const BODY_CENTER_Y = (2 * CANVAS_HEIGHT) / 3;
let body = {
  width: 200,
  height: 50,
  color: '#DC1C4B'
};
let fins = {
  color: '#87D1EE',
  tail: {
    width_percent: 0.03,
    height_percent: 0.2
  },
  top_fin: {
    width_percent: 0.3,
    height_percent: 0.1
  },
  side_fin: {
    width_percent: 0.1,
    height_percent: 0.3
  }
};
let eyes = {
  x_offset_ratio: 0.7,
  y_offset_ratio: 0.25,
  diameter: 25,
  pupil_diameter: 5
};
let mouth = {
  teeth: {
    num: 5,
    height: 5
  }
};

const findBodyYOffsetFromXOffset = xOffset => {
  return Math.sqrt(
    Math.pow(body.height / 2, 2) *
      (1 - Math.pow(xOffset, 2) / Math.pow(body.width / 2, 2))
  );
};

const findBodyXOffsetFromYOffset = yOffset => {
  return Math.sqrt(
    Math.pow(body.width / 2, 2) *
      (1 - Math.pow(yOffset, 2) / Math.pow(body.height / 2, 2))
  );
};

module.exports = p5 => {
  p5.getKnnData = () => {
    return [
      body.width,
      body.height,
      COLORS.indexOf(body.color),
      eyes.diameter,
      COLORS.indexOf(fins.color),
      fins.top_fin.width_percent,
      fins.top_fin.height_percent,
      fins.side_fin.width_percent,
      fins.side_fin.height_percent,
      fins.tail.width_percent,
      fins.tail.height_percent
    ];
  };

  p5.download = canvasId => {
    p5.saveCanvas(canvasId, 'png');
  };

  p5.setBodySize = (width, height) => {
    body.width = width;
    body.height = height;
    draw();
  };

  p5.setBodyColor = color => {
    body.color = color;
    draw();
  };

  p5.setEyeSize = diameter => {
    eyes.diameter = diameter;
    draw();
  };

  p5.setFinColor = color => {
    fins.color = color;
    draw();
  };

  p5.setTailSizeRelativeToBody = height_percent => {
    fins.tail.height_percent = height_percent;
    draw();
  };

  p5.setTopFinSizeRelativeToBody = (width_percent, height_percent) => {
    fins.top_fin.width_percent = width_percent;
    fins.top_fin.height_percent = height_percent;
    draw();
  };

  p5.setSideFinSizeRelativeToBody = (width_percent, height_percent) => {
    fins.side_fin.width_percent = width_percent;
    fins.side_fin.height_percent = height_percent;
    draw();
  };

  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    draw();
  };

  const draw = () => {
    p5.background(BG_COLOR);
    p5.noStroke();

    // top fin
    p5.fill(fins.color);
    const top_fin = fins.top_fin;
    const topFinWidth = top_fin.width_percent * body.width;
    const topFinHeight = top_fin.height_percent * body.height;
    const bodyYOffsetFromWidth = findBodyYOffsetFromXOffset(topFinWidth / 2);
    p5.beginShape();
    p5.vertex(BODY_CENTER_X - topFinWidth / 2, BODY_CENTER_Y - bodyYOffsetFromWidth);
    p5.vertex(BODY_CENTER_X, BODY_CENTER_Y - body.height / 2 - topFinHeight);
    p5.vertex(BODY_CENTER_X + topFinWidth / 2, BODY_CENTER_Y - bodyYOffsetFromWidth);
    p5.endShape(p5.CLOSE);

    // tail
    p5.fill(fins.color);
    const tail = fins.tail;
    const tailWidth = tail.width_percent * body.width;
    const tailHeight = tail.height_percent * body.height;
    p5.beginShape();
    p5.vertex(
      BODY_CENTER_X - findBodyXOffsetFromYOffset(tailHeight / 4),
      BODY_CENTER_Y - tailHeight / 4
    );
    p5.vertex(
      BODY_CENTER_X - body.width / 2 - tailWidth,
      BODY_CENTER_Y - tailHeight / 2
    );
    p5.vertex(
      BODY_CENTER_X - body.width / 2 - tailWidth,
      BODY_CENTER_Y + tailHeight / 2
    );
    p5.vertex(
      BODY_CENTER_X - findBodyXOffsetFromYOffset(tailHeight / 4),
      BODY_CENTER_Y + tailHeight / 4
    );
    p5.endShape(p5.CLOSE);

    // body
    p5.fill(body.color);
    p5.ellipse(BODY_CENTER_X, BODY_CENTER_Y, body.width, body.height);

    // side fin
    p5.fill(fins.color);
    const side_fin = fins.side_fin;
    const sideFinWidth = side_fin.width_percent * body.width;
    const sideFinHeight = side_fin.height_percent * body.height;
    p5.beginShape();
    //p5.vertex(230, 190);
    const startX = BODY_CENTER_X;
    const startY = BODY_CENTER_Y + body.height * .35;
    p5.vertex(startX, startY);
    p5.vertex(startX - sideFinWidth, startY - sideFinHeight / 3);
    p5.vertex(startX - sideFinWidth, startY + (2 * sideFinHeight) / 3);
    p5.vertex(startX, startY + sideFinHeight / 3);
    p5.endShape(p5.CLOSE);

    //mouth
    //p5.fill(BG_COLOR);
    p5.noFill();
    const yOffset = 0.15 * body.height;
    const mouthStartY = BODY_CENTER_Y + yOffset;
    const mouthStartX = Math.floor(
      BODY_CENTER_X + findBodyXOffsetFromYOffset(yOffset)
    );
    const mouthWidth = 0.25 * body.width;
    const mouthHeight = 0.12 * body.height;
    p5.beginShape();
    p5.vertex(mouthStartX, mouthStartY);
    p5.vertex(mouthStartX - mouthWidth, mouthStartY);
    const bottom_lip_start = [mouthStartX - mouthWidth, mouthStartY];
    const bottom_lip_end = [
      BODY_CENTER_X + findBodyXOffsetFromYOffset(yOffset + mouthHeight),
      mouthStartY + mouthHeight
    ];

    p5.bezierVertex(
      bottom_lip_start[0] + (bottom_lip_end[0] - bottom_lip_start[0]) * 0.33,
      bottom_lip_start[1] + (bottom_lip_end[1] - bottom_lip_start[1]) * 0.85,
      bottom_lip_start[0] + (bottom_lip_end[0] - bottom_lip_start[0]) * 0.67,
      bottom_lip_start[1] + (bottom_lip_end[1] - bottom_lip_start[1]),
      BODY_CENTER_X + findBodyXOffsetFromYOffset(yOffset + mouthHeight),
      mouthStartY + mouthHeight
    );
    p5.bezierVertex(
      285,
      findBodyYOffsetFromXOffset(85) + BODY_CENTER_Y,
      290,
      findBodyYOffsetFromXOffset(90) + BODY_CENTER_Y,
      mouthStartX,
      mouthStartY
    );
    p5.endShape(p5.CLOSE);
    p5.noFill();

    // teeth
    p5.fill('white');
    const startPoint = [mouthStartX, mouthStartY - 1];
    const endPoint = [bottom_lip_start[0], bottom_lip_start[1] - 1];
    const topMouthWidth = startPoint[0] - endPoint[0];
    const numTeeth = mouth.teeth.num;
    const toothHeight = mouth.teeth.height;
    const toothWidth = topMouthWidth / numTeeth;
    p5.beginShape();
    p5.vertex(...startPoint);
    for (var i = 1; i <= numTeeth; ++i) {
      p5.vertex(
        startPoint[0] - i * toothWidth + toothWidth / 2,
        startPoint[1] + toothHeight
      );
      p5.vertex(startPoint[0] - i * toothWidth, startPoint[1]);
    }
    p5.endShape();

    // eye
    const eye_x_offset = Math.floor((eyes.x_offset_ratio * body.width) / 2);
    const eye_y_offset = Math.floor((eyes.y_offset_ratio * body.height) / 2);
    const eye_center_x = BODY_CENTER_X + eye_x_offset;
    const eye_center_y = BODY_CENTER_Y - eye_y_offset;
    p5.fill('white');
    p5.ellipse(eye_center_x, eye_center_y, eyes.diameter, eyes.diameter);
    p5.fill('black');
    p5.ellipse(
      eye_center_x,
      eye_center_y,
      eyes.pupil_diameter,
      eyes.pupil_diameter
    );
  };
};

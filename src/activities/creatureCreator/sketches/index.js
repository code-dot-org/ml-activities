/**
 * CONSTANTS
 */
const CANVAS_WIDTH = 400;
const CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_HEIGHT = 400;
const CENTER_Y = CANVAS_WIDTH / 2;
const CANVAS_BG_COLOR = [243, 243, 243];

const MIN_BODY_SIZE = 100;
const MIN_EYE_SIZE = 20;
const MOUTH_TO_EYE_DISTANCE = 20;
const MIN_MOUTH_SIZE = 5;
const MAX_MOUTH_SIZE = 80;

/**
 * TYPES
 */
export const CreatureType = Object.freeze({
  None: 0,
  Good: 1,
  Bad: 2
});

const BodyShape = Object.freeze({
  None: 0,
  Rect: 1,
  Ellipse: 2
});

/**
 * SIZES
 */
let body = {
  width: (CANVAS_WIDTH / 2 - MIN_BODY_SIZE) * 0.5 + MIN_BODY_SIZE,
  height: (CANVAS_HEIGHT / 2 - MIN_BODY_SIZE) * 0.5 + MIN_BODY_SIZE
};
body.minX = Math.floor((CANVAS_WIDTH - body.width) / 2);
body.minY = Math.floor((CANVAS_HEIGHT - body.height) / 2);
let bodyColor = [127, 127, 127];
let mouth = {
  width: (MAX_MOUTH_SIZE - MIN_MOUTH_SIZE) * 0.5 + MIN_MOUTH_SIZE,
  height: (MAX_MOUTH_SIZE - MIN_MOUTH_SIZE) * 0.5 + MIN_MOUTH_SIZE
};
let eye = {
  size: (body.width / 2 - MIN_EYE_SIZE) * 0.5 + MIN_EYE_SIZE,
  yPos: body.height
};
eye.leftX = (CENTER_X - eye.size / 2 - body.minX) * 0.5 + body.minX;
let creatureType = 0;

/**
 * P5
 */
const sketch = p5 => {
  let eyes, drawMouth;

  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.background(CANVAS_BG_COLOR);
  };

  const draw = () => {
    p5.clear();
    p5.background(CANVAS_BG_COLOR);

    drawBody();

    if (drawMouth) {
      drawMouth();
    }

    (eyes || []).forEach(drawEye);
  };

  // Draws an eye with a pupil given an eye, represented as follows: [xPos, yPos, size]
  const drawEye = eye => {
    // outer eye
    p5.fill(255, 255, 255);
    p5.ellipse(...eye);

    // pupil
    let pupil = [...eye];
    pupil[2] /= 10;
    p5.fill(0, 0, 0);
    p5.ellipse(...pupil);
  };

  p5.setBodySize = (width_percent, height_percent) => {
    body.width =
      (CANVAS_WIDTH / 2 - MIN_BODY_SIZE) * width_percent + MIN_BODY_SIZE;
    body.height =
      (CANVAS_HEIGHT / 2 - MIN_BODY_SIZE) * height_percent + MIN_BODY_SIZE;

    body.minX = Math.floor((CANVAS_WIDTH - body.width) / 2);
    body.minY = Math.floor((CANVAS_HEIGHT - body.height) / 2);
    draw();
  };

  p5.setMouthSize = (width_percent, height_percent) => {
    mouth.width =
      (MAX_MOUTH_SIZE - MIN_MOUTH_SIZE) * width_percent + MIN_MOUTH_SIZE;
    mouth.height =
      (MAX_MOUTH_SIZE - MIN_MOUTH_SIZE) * height_percent + MIN_MOUTH_SIZE;
    draw();
  };

  p5.setBodyColor = (r, g, b) => {
    bodyColor = [r, g, b];
    draw();
  };

  p5.setEyeSizeAndPos = (
    eye_size_percent,
    left_eye_x_pos_percent,
    eye_y_pos_percent
  ) => {
    eye.size =
      (body.width / 2 - MIN_EYE_SIZE) * eye_size_percent + MIN_EYE_SIZE;
    eye.leftX =
      (CENTER_X - eye.size / 2 - body.minX) * left_eye_x_pos_percent +
      body.minX;
    eye.yPos = (body.height / 2) * eye_y_pos_percent + body.minY;
    draw();
  };

  const drawBody = () => {
    const bodyShape = bodyShapeFor(creatureType);

    if (bodyShape === BodyShape.Rect) {
      body.minX = Math.floor((CANVAS_WIDTH - body.width) / 2);
      body.minY = Math.floor((CANVAS_HEIGHT - body.height) / 2);
    } else if (bodyShape === BodyShape.Ellipse) {
      body.minX = CENTER_X - body.width / 2;
      body.minY = CENTER_Y - body.height / 2;
    }

    p5.fill(...bodyColor);

    if (bodyShape === BodyShape.Rect) {
      p5.rect(body.minX, body.minY, body.width, body.height, 10);
    } else if (bodyShape === BodyShape.Ellipse) {
      p5.ellipse(CENTER_X, CENTER_Y, body.width, body.height);
    }

    // TODO: (madelynkasula) Make eye positioning more accurate for ellipse bodies.
    const eyeSize = eye.size;
    const leftEyeXPos = eye.leftX;
    const rightEyeXPos = CENTER_X + (CENTER_X - leftEyeXPos);
    const eyeYPos = eye.yPos;
    eyes = [[leftEyeXPos, eyeYPos, eyeSize], [rightEyeXPos, eyeYPos, eyeSize]];
    drawMouth = () => {
      const yPos = eyeYPos + eyeSize / 2 + MOUTH_TO_EYE_DISTANCE;
      p5.noFill();

      if (creatureType === CreatureType.Good) {
        // smile
        p5.arc(CENTER_X, yPos, mouth.width, mouth.height, 0, Math.PI);
      } else if (creatureType === CreatureType.Bad) {
        // frown
        p5.arc(CENTER_X, yPos, mouth.width, mouth.height, Math.PI, 2 * Math.PI);
      }
    };
  };

  p5.setCreature = type => {
    creatureType = type;
    draw();
  };

  p5.download = canvasId => {
    p5.saveCanvas(canvasId, 'png');
  };
};

export default sketch;

/**
 * HELPER FUNCTIONS
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * Math.floor(max + 1 - min) + min);
};

const bodyShapeFor = creatureType => {
  if (creatureType === CreatureType.Good) {
    return BodyShape.Rect;
  } else if (creatureType === CreatureType.Bad) {
    return BodyShape.Ellipse;
  } else {
    console.error('Unknown CreatureType!');
    return BodyShape.None;
  }
};

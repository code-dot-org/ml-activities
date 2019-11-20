import 'idempotent-babel-polyfill';
import {getState, setState} from './state';
import constants, {AppMode, Modes, ClassType} from './constants';
import CanvasCache from './canvasCache';
import {
  backgroundPathForMode,
  finishMovement,
  currentRunTime,
  $time
} from './helpers';
import colors from './colors';
import {predictFish} from './models/predict';
import {
  loadAllFishPartImages,
  loadAllSeaCreatureImages,
  loadAllTrashImages,
  initMobilenet,
  FishOceanObject,
  SeaCreatureOceanObject
} from './OceanObject';
import aiBotClosed from '../../public/images/ai-bot/ai-bot-closed.png';
import aiBotCheckmark from '../../public/images/ai-bot/ai-bot-checkmark.png';
import aiBotX from '../../public/images/ai-bot/ai-bot-x.png';
import redScanner from '../../public/images/ai-bot/red-scanner.png';
import greenScanner from '../../public/images/ai-bot/green-scanner.png';
import blueScanner from '../../public/images/ai-bot/blue-scanner.png';
import {playSound} from './models/soundLibrary';
import checkmarkIcon from '../../public/images/checkmark-icon.png';
import banIcon from '../../public/images/ban-icon.png';

let prevState = {};
let currentModeStartTime = $time();
let canvasCache;
let botImages = {};
let botVelocity = 10;
let botY, botYDestination;
let currentPredictedClassId;
let predictionImages = {};
let predictionIndex;

/**
 * currentRawXOffset & lastRawXOffset track fish movement.
 * lastRawXOffset is set every time drawMovingFish() is called, and records
 * our current x offset. This allows the user to pause, play, rewind, and
 * fast-forward the fish without them jumping around as our time scale changes.
 */
let currentRawXOffset, lastRawXOffset;

export const initRenderer = () => {
  canvasCache = new CanvasCache();
  let promises = [];
  promises.push(loadAllFishPartImages());
  if (getState().loadTrashImages) {
    promises.push(loadAllTrashImages());
    promises.push(loadAllSeaCreatureImages());
    promises.push(initMobilenet());
  }
  return Promise.all(promises);
};

// Render a single frame of the scene.
// Sometimes performs special rendering actions, such as when mode has changed.
export const render = () => {
  let state = getState();

  if (state.currentMode !== prevState.currentMode) {
    canvasCache.clearCache();
    drawBackground(state);
    currentModeStartTime = $time();
    botY = null;
    botYDestination = null;
    currentPredictedClassId = null;
    currentRawXOffset = null;
    lastRawXOffset = null;
    state = setState({lastPauseTime: 0, lastStartTime: null});

    if (state.currentMode === Modes.Training) {
      state = setState({moveTime: constants.defaultMoveTime / 2});
    } else {
      state = setState({moveTime: constants.defaultMoveTime});
    }

    if (state.currentMode === Modes.Predicting) {
      loadAllBotImages();
      loadAllPredictionImages();
    }
  }

  if (!state.predictingIndex && prevState.predictingIndex) {
    finishMovement();
    state = setState({
      isRunning: true,
      isPaused: false,
      moveTime: constants.defaultMoveTime / state.timeScale
    });
  }

  if (
    state.currentMode === Modes.Predicting &&
    state.lastPauseTime &&
    (state.moveTime !== prevState.moveTime ||
      state.rewind !== prevState.rewind ||
      state.isRunning !== prevState.isRunning)
  ) {
    currentRawXOffset = lastRawXOffset;
  }

  if (state.isRunning && !state.lastStartTime) {
    state = setState({lastStartTime: $time()});
  }

  clearCanvas(state.canvas);

  const timeBeforeCanSkipPredict = 5000;
  const timeBeforeCanSkipBiasText = 2000;
  const timeBeforeCanSeePondText = 3000;
  const timeBeforeCanSkipPond = 5000;

  switch (state.currentMode) {
    case Modes.Training:
      drawMovingFish(state);
      break;
    case Modes.Predicting:
      drawPredictBot(state);
      drawMovingFish(state);

      if (state.appMode === AppMode.CreaturesVTrashDemo) {
        if (state.biasTextTime) {
          setState({
            canSkipPredict:
              $time() >= state.biasTextTime + timeBeforeCanSkipBiasText
          });
        }
      } else if (state.isRunning) {
        setState({
          canSkipPredict:
            $time() >= state.runStartTime + timeBeforeCanSkipPredict
        });
      }

      break;
    case Modes.Pond:
      drawPondFishImages();

      setState({
        canSkipPond: $time() >= currentModeStartTime + timeBeforeCanSkipPond,
        canSeePondText:
          $time() >= currentModeStartTime + timeBeforeCanSeePondText
      });
      break;
  }

  drawOverlays();

  prevState = {...state};
  window.requestAnimFrame(render);
};

// Load and display the background image onto the background canvas.
export const drawBackground = state => {
  const canvas = state.backgroundCanvas;
  if (!canvas) {
    return;
  }

  const imgPath = backgroundPathForMode(state.currentMode);
  if (imgPath) {
    loadImage(imgPath).then(img => {
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    });
  } else {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
};

// Load a single image.
// Used by drawBackground and loadAllBotImages.
const loadImage = imgPath => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve(img));
    img.addEventListener('error', () => {
      reject(new Error(`Failed to load image at #{imgPath}`));
    });
    img.src = imgPath;
  });
};

// Loads all bot + bot scanner images and caches them in botImages.
const loadAllBotImages = async () => {
  botImages = {}; // Empty previous cache
  const imagesToLoad = {
    defaultBot: aiBotClosed,
    defaultScanner: blueScanner,
    likeBot: aiBotCheckmark,
    likeScanner: greenScanner,
    dislikeBot: aiBotX,
    dislikeScanner: redScanner
  };
  let imagePromises = [];

  Object.keys(imagesToLoad).forEach(key => {
    imagePromises.push(
      loadImage(imagesToLoad[key]).then(img => {
        botImages[key] = img;
      })
    );
  });

  await Promise.all(imagePromises);
};

// Loads all prediction icon images and cached them in predictionImages.
const loadAllPredictionImages = async () => {
  predictionImages = {}; // Empty previous cache
  const imagesToLoad = {
    like: checkmarkIcon,
    dislike: banIcon
  };
  let imagePromises = [];

  Object.keys(imagesToLoad).forEach(key => {
    imagePromises.push(
      loadImage(imagesToLoad[key]).then(img => {
        predictionImages[key] = img;
      })
    );
  });

  await Promise.all(imagePromises);
};

const getRawOffsetForTime = (state, t, offset = 0) => {
  // Normalize the fish movement amount from 0 to 1.
  return offset + t / state.moveTime;
};

// Calculate the screen's current X offset.
const getOffsetForTime = (state, t, offset = 0) => {
  let amount = getRawOffsetForTime(state, t, offset);

  // Apply an S-curve to that amount.
  amount -= Math.sin(amount * 2 * Math.PI) / (2 * Math.PI);

  return (
    constants.fishCanvasWidth * state.fishData.length -
    constants.canvasWidth / 2 +
    constants.fishCanvasWidth / 2 -
    Math.round(amount * constants.fishCanvasWidth)
  );
};

// Given X (screenX + offsetX), calculate the fish index at that X.
const getFishIdxForLocation = (screenX, offsetX, totalFish) => {
  const n = Math.floor((screenX + offsetX) / constants.fishCanvasWidth);
  return totalFish - n;
};

// Calculate a given fish's X position.
const getXForFish = (numFish, fishIdx, offsetX) => {
  return (numFish - fishIdx) * constants.fishCanvasWidth - offsetX;
};

// Calculate a given fish's Y position.
// It will begin dropping as they pass the midpoint on the screen if not
// liked.
const getYForFish = (numFish, fishIdx, state, offsetX, predictedClassId) => {
  let y = constants.canvasHeight / 2 - constants.fishCanvasHeight / 2;

  // Move fish down a little on predict screen.
  if (state.currentMode === Modes.Predicting) {
    y += 50;

    // And drop the fish down even more if they are not liked.
    const doesLike = predictedClassId === ClassType.Like;
    if (!doesLike) {
      const midScreenX =
        constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;
      const screenX = getXForFish(numFish, fishIdx, offsetX);
      if (screenX > midScreenX) {
        y += screenX - midScreenX;
      }
    }

    // And sway fish vertically on the predicting screen.
    const swayValue =
      (($time() * 360) / (20 * 1000) + (fishIdx + 1) * 10) % 360;
    const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 8;
    y += swayOffsetY;
  }

  return y;
};

const getTimes = state => {
  const runtime = currentRunTime(state, state.currentMode === Modes.Training);
  let t = currentRawXOffset ? 0 : state.lastPauseTime;
  t += state.rewind ? -runtime : runtime;

  return {runtime, t};
};

const fishMidScreenX = () => {
  return constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;
};

const drawMovingFish = state => {
  const {runtime, t} = getTimes(state);

  const offsetX = getOffsetForTime(state, t, currentRawXOffset);
  lastRawXOffset = getRawOffsetForTime(state, t, currentRawXOffset);

  const maxScreenX =
    state.currentMode === Modes.Training
      ? constants.canvasWidth - 100
      : constants.canvasWidth + constants.fishCanvasWidth;
  const startFishIdx = Math.max(
    getFishIdxForLocation(maxScreenX, offsetX, state.fishData.length),
    0
  );
  const lastFishIdx = Math.min(
    getFishIdxForLocation(0, offsetX, state.fishData.length),
    state.fishData.length - 1
  );
  const ctx = state.canvas.getContext('2d');

  let centerFish, centerFishIndex;
  for (let i = startFishIdx; i <= lastFishIdx; i++) {
    const fish = state.fishData[i];
    const x = getXForFish(state.fishData.length - 1, i, offsetX);
    const y = getYForFish(
      state.fishData.length - 1,
      i,
      state,
      offsetX,
      fish.getResult() ? fish.getResult().predictedClassId : false
    );

    let canDrawPrediction = false;
    if (state.currentMode === Modes.Predicting) {
      if (fish.getResult()) {
        const midScreenX = fishMidScreenX();
        canDrawPrediction = x >= midScreenX;
        const nearCenterX = x - midScreenX <= 25;

        if (canDrawPrediction && nearCenterX) {
          centerFish = fish;
          centerFishIndex = i;

          if (
            state.isRunning &&
            state.appMode === AppMode.CreaturesVTrashDemo
          ) {
            if (fish instanceof FishOceanObject) {
              fish.result.predictedClassId = 0;
            } else if (fish instanceof SeaCreatureOceanObject) {
              fish.result.predictedClassId = 1;
            } else {
              fish.result.predictedClassId = 1;
            }

            const atCenterX = Math.abs(midScreenX - x) <= 1;
            if (i === lastFishIdx && atCenterX) {
              finishMovement(t);
              setState({biasTextTime: $time()});
            }
          }
        }
      } else {
        predictFish(state, i).then(prediction => {
          fish.setResult(prediction);
        });
      }
    }

    if (canDrawPrediction) {
      if (centerFish && i !== state.predictingIndex) {
        finishMovement();
        setState({
          predictingIndex: i,
          predictionStartTime: $time(),
          isRunning: true,
          isPaused: false,
          moveTime: state.moveTime * 1.75
        });
      }

      drawPrediction(ctx, x, y, i, fish.getResult().predictedClassId);
    }

    drawSingleFish(fish, x, y, ctx, 1);
  }

  if (state.currentMode === Modes.Predicting) {
    currentPredictedClassId = centerFish
      ? centerFish.getResult().predictedClassId
      : null;

    if (!centerFish) {
      setState({
        predictingIndex: null,
        predictionStartTime: null
      });
    }
  }

  if (state.currentMode === Modes.Training && runtime === state.moveTime) {
    finishMovement(t, false);
  }
};

const drawPolaroid = (ctx, x, y) => {
  const rectSize = constants.fishFrameSize;
  const xDiff = Math.abs(rectSize - constants.fishCanvasWidth) / 2;
  const adjustedX = x + xDiff;
  const yDiff = Math.abs(rectSize - constants.fishCanvasHeight) / 2;
  const adjustedY = y - yDiff;

  DrawRect(
    adjustedX - 10,
    adjustedY - 10,
    rectSize + 20,
    rectSize + 60,
    colors.white
  );
  DrawRect(adjustedX, adjustedY, rectSize, rectSize, colors.darkGrey);
};

// Draws a prediction stamp to the canvas for the item at the given index in state.fishData.
// Note: This method requires icons to be cached in predictionImages.
// Call loadAllPredictionImages() before this method.
const drawPrediction = (ctx, x, y, index) => {
  const state = getState();
  const fish = state.fishData[index];

  let t = 1000;
  if (index === state.predictingIndex) {
    if (state.rewind) {
      t = state.predictionStartTime - $time();
    } else {
      t = $time() - state.predictionStartTime;
    }
  }

  // No-op if fish or prediction cannot be found, or prediction should be hidden (based on t).
  const hidePrediction = t < 250;
  if (!fish || (fish && !fish.getResult()) || hidePrediction) {
    return;
  }

  const rectSize = constants.fishFrameSize;
  const {x: fishX, y: fishY} = getAdjustmentsForFish(state.canvas, x, y);
  const xDiff = Math.abs(rectSize - constants.fishCanvasWidth) / 2;
  const yDiff = Math.abs(rectSize - constants.fishCanvasHeight) / 2;
  const adjustedX = fishX + xDiff;
  const adjustedY = fishY - yDiff;
  const predictedClassId = fish.getResult().predictedClassId;

  // Draw square around item
  ctx.beginPath();
  const color =
    predictedClassId === ClassType.Like ? colors.brightGreen : colors.red;
  ctx.lineWidth = '2';
  DrawRect(adjustedX, adjustedY, rectSize, rectSize, color, false);
  ctx.stroke();

  // Draw icon below square. This code expects predictionImages to be populated
  // with cached like/dislike icons.
  const icon =
    predictedClassId === ClassType.Like
      ? predictionImages.like
      : predictionImages.dislike;

  if (icon) {
    const iconX = adjustedX + rectSize / 2 - icon.width / 2;
    const iconY = adjustedY + rectSize + 10;
    ctx.drawImage(icon, iconX, iconY);
  }
};

let lastScannerImg = null;

// Draw AI bot + scanner to canvas for predict mode.
// *Note:* This will no-op if the expected bot/scanner is not present
// in the botImages cache. Call loadAllBotImages() to populate the botImages cache.
const drawPredictBot = state => {
  let botImg, scannerImg;
  if (currentPredictedClassId === ClassType.Like) {
    botImg = botImages.likeBot;
    scannerImg = botImages.likeScanner;
  } else if (currentPredictedClassId === ClassType.Dislike) {
    botImg = botImages.dislikeBot;
    scannerImg = botImages.dislikeScanner;
  } else {
    botImg = botImages.defaultBot;
    scannerImg = botImages.defaultScanner;
  }

  if (!botImg || !scannerImg) {
    return;
  }

  if (scannerImg !== lastScannerImg) {
    if (scannerImg === botImages.likeScanner) {
      playSound('sortyes');
    } else if (scannerImg === botImages.dislikeScanner) {
      playSound('sortno');
    }
    lastScannerImg = scannerImg;
  }

  let botX = state.canvas.width / 2 - botImg.width / 2;
  botY = botY || state.canvas.height / 2 - botImg.height / 2;
  const ctx = state.canvas.getContext('2d');

  // Move AI bot above fish parade.
  if (state.isRunning || state.isPaused) {
    botYDestination = botYDestination || botY - 170;

    const distToDestination = Math.abs(botYDestination - botY);
    if (distToDestination > 1) {
      const direction = distToDestination === botYDestination - botY ? 1 : -1;
      botY += direction * botVelocity;
    }

    // Draw scanner.
    const scannerX = state.canvas.width / 2 - scannerImg.width / 2;
    ctx.drawImage(scannerImg, scannerX, botY + 50);
  }

  // Draw bot.
  ctx.drawImage(botImg, botX, botY);
};

// Draw the fish for pond mode.
const drawPondFishImages = () => {
  const canvas = getState().canvas;
  const ctx = canvas.getContext('2d');

  const fishBounds = [];

  getState().pondFish.forEach(fish => {
    const pondClickedFish = getState().pondClickedFish;
    const pondClickedFishUs = pondClickedFish && fish.id === pondClickedFish.id;

    const swayValue =
      (($time() * 360) / (20 * 1000) + (fish.getId() + 1) * 10) % 360;
    const swayMultipleX = 120;
    const swayOffsetX =
      Math.sin(((swayValue * Math.PI) / 180) * 2) * swayMultipleX;
    const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 8;

    const xy = fish.getXY();
    const finalX = xy.x + swayOffsetX;
    const finalY = xy.y + swayOffsetY;

    const size = pondClickedFishUs ? 1 : 0.5;

    const fishBound = drawSingleFish(fish, finalX, finalY, ctx, size);

    // Record this screen location so that we can separately check for clicks on it.
    fishBounds.push({
      fishId: fish.id,
      ...fishBound
    });
    setState({pondFishBounds: fishBounds}, {skipCallback: true});
  });
};

const getAdjustmentsForFish = (canvas, x, y, size = 1) => {
  const width = canvas.width * size;
  const height = canvas.height * size;

  // Maintain the center of the fish.
  x = Math.round(x - width / 2 + canvas.width / 2);
  y = Math.round(y - height / 2 + canvas.height / 2);

  return {width, height, x, y};
};

// Draw a single fish, preferably from cached canvas.
// Used by drawMovingFish and drawPondFishImages.
// Takes an optional size multipler, where 0.5 means fish are half size.
// Returns an object with x, y, width and height of actual draw.
const drawSingleFish = (fish, fishXPos, fishYPos, ctx, size = 1) => {
  const [fishCanvas, hit] = canvasCache.getCanvas(fish.id);
  if (!hit) {
    fishCanvas.width = constants.fishCanvasWidth;
    fishCanvas.height = constants.fishCanvasHeight;
    fish.drawToCanvas(fishCanvas);
  }

  // TODO: Does scaling during drawImage have a performance impact on some
  // devices/browsers?  We might need to pre-cache scaled images.

  // Maintain the center of the fish.
  const {width, height, x, y} = getAdjustmentsForFish(
    fishCanvas,
    fishXPos,
    fishYPos,
    size
  );

  if (getState().currentMode === Modes.Training) {
    drawPolaroid(ctx, x, y);
  }

  ctx.drawImage(fishCanvas, x, y, width, height);

  return {x, y, w: width, h: height};
};

// Clear the sprite canvas.
export const clearCanvas = canvas => {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
};

// Draw an overlay over the whole scene.  Used for fades.
const drawOverlays = () => {
  const duration = $time() - currentModeStartTime;
  let amount = 1 - duration / 800;
  if (amount < 0) {
    amount = 0;
  }
  DrawFade(amount, '#000');
};

// Draw a fade over the scene.
const DrawFade = (amount, overlayColour) => {
  if (amount === 0) {
    return;
  }

  const canvasCtx = getState().canvas.getContext('2d');
  canvasCtx.globalAlpha = amount;
  DrawRect(0, 0, constants.canvasWidth, constants.canvasHeight, overlayColour);
  canvasCtx.globalAlpha = 1;
};

// Draw a rectangle.
const DrawRect = (x, y, w, h, color, filled = true) => {
  x = Math.floor(x / 1);
  y = Math.floor(y / 1);
  w = Math.floor(w / 1);
  h = Math.floor(h / 1);

  const canvasCtx = getState().canvas.getContext('2d');
  if (filled) {
    if (color) {
      canvasCtx.fillStyle = color;
    }

    canvasCtx.fillRect(x, y, w, h);
  } else {
    if (color) {
      canvasCtx.strokeStyle = color;
    }

    canvasCtx.rect(x, y, w, h);
  }
};

// A single frame of animation.
window.requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

import 'idempotent-babel-polyfill';
import {getState, setState} from './state';
import constants, {AppMode, Modes, ClassType} from './constants';
import CanvasCache from './canvasCache';
import {
  backgroundPathForMode,
  finishMovement,
  currentRunTime,
  randomInt,
  filterFishComponents,
  $time
} from './helpers';
import {fishData} from '../utils/fishData';
import colors from './styles/colors';
import {predictFish} from './models/predict';
import {
  loadAllFishPartImages,
  loadAllSeaCreatureImages,
  loadAllTrashImages,
  initMobilenet,
  FishOceanObject,
  SeaCreatureOceanObject
} from './OceanObject';
import aiBotClosed from '@public/images/ai-bot/ai-bot-closed.png';
import aiBotYes from '@public/images/ai-bot/ai-bot-yes.png';
import aiBotNo from '@public/images/ai-bot/ai-bot-no.png';
import redScanner from '@public/images/ai-bot/red-scanner.png';
import greenScanner from '@public/images/ai-bot/green-scanner.png';
import blueScanner from '@public/images/ai-bot/blue-scanner.png';
import soundLibrary from './models/soundLibrary';
import bluePredictionFrame from '@public/images/blue-prediction-frame.png';
import questionIcon from '@public/images/question-icon.png';
import greenPredictionFrame from '@public/images/green-prediction-frame.png';
import checkmarkIcon from '@public/images/checkmark-icon.png';
import redPredictionFrame from '@public/images/red-prediction-frame.png';
import banIcon from '@public/images/ban-icon.png';
import polaroidFrame from '@public/images/polaroid-frame.png';

let prevState = {};
let currentModeStartTime = $time();
let canvasCache;
let botImages = {};
let botVelocity = 10;
let botY, botYDestination;
let currentPredictedClassId;
let predictionImages = {};
let polaroidFrameImage;

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
  // Set up the next call to the renderer.  One advantage of doing it here is
  // that if any exceptions occur, we will have still scheduled the next render.
  // Otherwise, any exception that occurs would prevent any more renders from
  // happening.
  window.requestAnimFrame(render);

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
  const timeBeforeCanSkipPond = 3000;

  switch (state.currentMode) {
    case Modes.Words:
      drawWordFishImages();
      break;
    case Modes.Training:
      drawPolaroidFrame(state.canvas);
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

  // Don't draw overlays on loading screens.
  if (![Modes.Loading, Modes.IntermediateLoading].includes(state.currentMode)) {
    drawOverlays();
  }

  prevState = {...state};
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
    likeBot: aiBotYes,
    likeScanner: greenScanner,
    dislikeBot: aiBotNo,
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
    defaultFrame: bluePredictionFrame,
    defaultIcon: questionIcon,
    likeFrame: greenPredictionFrame,
    likeIcon: checkmarkIcon,
    dislikeFrame: redPredictionFrame,
    dislikeIcon: banIcon
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
        y += 1.2 * (screenX - midScreenX);
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

const drawMovingFish = state => {
  const runtime = currentRunTime(state, state.currentMode === Modes.Training);
  let t = currentRawXOffset ? 0 : state.lastPauseTime;
  t += state.rewind ? -runtime : runtime;

  const offsetX = getOffsetForTime(state, t, currentRawXOffset);
  lastRawXOffset = getRawOffsetForTime(state, t, currentRawXOffset);

  const maxScreenX =
    state.currentMode === Modes.Training
      ? constants.canvasWidth - 63
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
  const midScreenX = constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;

  let centerFish;
  for (let i = startFishIdx; i <= lastFishIdx; i++) {
    const fish = state.fishData[i];
    const x = getXForFish(state.fishData.length - 1, i, offsetX);
    let y = getYForFish(
      state.fishData.length - 1,
      i,
      state,
      offsetX,
      fish.getResult() ? fish.getResult().predictedClassId : false
    );

    let drawPrediction = false;
    if (state.currentMode === Modes.Predicting) {
      if (fish.getResult()) {
        drawPrediction = x >= midScreenX;
        const nearCenterX = x - midScreenX <= 50;

        if (drawPrediction && nearCenterX) {
          centerFish = fish;

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

            if (i === lastFishIdx && Math.abs(midScreenX - x) <= 1) {
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

    const drawPolaroid = state.currentMode === Modes.Training;
    let size = 1;
    if (drawPolaroid && state.isRunning && x > midScreenX) {
      size = 0.35;
      // Apply sine wave to y-value to make item jump into AI bot's head.
      y -= Math.sin((runtime / state.moveTime) * Math.PI) * 200;
    }

    drawSingleFish(fish, x, y, ctx, size, drawPrediction, drawPolaroid);
  }

  if (state.currentMode === Modes.Predicting) {
    currentPredictedClassId = centerFish
      ? centerFish.getResult().predictedClassId
      : null;
  }

  if (state.currentMode === Modes.Training && runtime === state.moveTime) {
    finishMovement(t, false);
  }
};

const drawPolaroidFrame = canvas => {
  if (polaroidFrameImage) {
    const x = canvas.width / 2 - polaroidFrameImage.width / 2;
    const y = canvas.height / 2 - polaroidFrameImage.height / 2 + 20;

    canvas.getContext('2d').drawImage(polaroidFrameImage, x, y);
  } else {
    loadImage(polaroidFrame).then(img => {
      polaroidFrameImage = img;
      drawPolaroidFrame(canvas);
    });
  }
};

const drawPolaroid = (ctx, x, y, size = 1) => {
  const rectSize = constants.fishFrameSize * size;
  const xDiff = Math.abs(rectSize - constants.fishCanvasWidth * size) / 2;
  const adjustedX = x + xDiff;
  const yDiff = Math.abs(rectSize - constants.fishCanvasHeight * size) / 2;
  const adjustedY = y - yDiff;

  // White outer polaroid frame
  const padding = 10 * size;
  const paddingBottom = 60 * size;
  DrawRect(
    adjustedX - padding,
    adjustedY - padding,
    rectSize + padding * 2,
    rectSize + paddingBottom,
    colors.white
  );
  // Dark grey inner polaroid frame (where item is displayed)
  DrawRect(adjustedX, adjustedY, rectSize, rectSize, colors.darkGrey);
};

const keyForClassId = classId => {
  let classKey = 'default';
  if (classId === ClassType.Like) {
    classKey = 'like';
  } else if (classId === ClassType.Dislike) {
    classKey = 'dislike';
  }

  return classKey;
};

// Draws a prediction stamp to the canvas for the given classId.
// *Note:* This will no-op if the expected frame/icon is not present
// in the predictionImages cache. Call loadAllPredictionImages() to populate the predictionImages cache.
const drawPrediction = (ctx, x, y, classId) => {
  const classKey = keyForClassId(classId);
  const frame = predictionImages[`${classKey}Frame`];
  const icon = predictionImages[`${classKey}Icon`];
  const w = (frame && frame.width) || constants.fishFrameSize;
  const h = (frame && frame.height) || constants.fishFrameSize;
  const adjustedX = x + Math.abs(w - constants.fishCanvasWidth) / 2;
  const adjustedY = y - Math.abs(h - constants.fishCanvasHeight) / 2;

  // Draw frame
  if (frame) {
    ctx.drawImage(frame, adjustedX, adjustedY);
  }

  // Draw icon below frame.
  if (icon) {
    const iconX = adjustedX + w / 2 - icon.width / 2;
    const iconY = adjustedY + h + 15;
    ctx.drawImage(icon, iconX, iconY);
  }
};

let lastScannerImg = null;

// Draw AI bot + scanner to canvas for predict mode.
// *Note:* This will no-op if the expected bot/scanner is not present
// in the botImages cache. Call loadAllBotImages() to populate the botImages cache.
const drawPredictBot = state => {
  const classKey = keyForClassId(currentPredictedClassId);
  const botImg = botImages[`${classKey}Bot`];
  const scannerImg = botImages[`${classKey}Scanner`];

  if (!botImg || !scannerImg) {
    return;
  }

  if (scannerImg !== lastScannerImg) {
    if (scannerImg === botImages.likeScanner) {
      soundLibrary.playSound('sortyes');
    } else if (scannerImg === botImages.dislikeScanner) {
      soundLibrary.playSound('sortno');
    }
    lastScannerImg = scannerImg;
  }

  let botX = state.canvas.width / 2 - botImg.width / 2;
  botY = botY || state.canvas.height / 2 - botImg.height / 2;
  const ctx = state.canvas.getContext('2d');

  // Move AI bot above fish parade.
  if (state.isRunning || state.isPaused) {
    botYDestination = botYDestination || botY - 179;

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

const drawWordFishImages = () => {
  const canvas = getState().canvas;
  const ctx = canvas.getContext('2d');
  const state = getState();

  const fishScale = 0.7;
  const possibleFishComponents = filterFishComponents(fishData, state.appMode);
  let fishCount = state.fishCount;
  // To prevent all the fish from being generated at the exact same time, only generate
  // one per animation cycle.
  let newFishGenerated = false;

  const t = $time();
  // Go through each "lane" on the screen and update the fish's position in that lane.
  // Each lane should only have one fish and once the fish is completely off the screen,
  // we should generate a new one.
  Object.keys(state.wordFish).forEach(lane => {
    let fish = state.wordFish[lane];
    if (
      !newFishGenerated &&
      (!fish ||
        fish.xy.x > constants.canvasWidth + constants.fishCanvasWidth ||
        fish.xy.x < -constants.fishCanvasWidth)
    ) {
      const newFish = new FishOceanObject(fishCount, possibleFishComponents);
      fishCount++;
      newFish.randomize();
      const y = lane * constants.fishCanvasHeight * fishScale;
      newFish.setXY({x: -constants.fishCanvasWidth, y});
      // As there should never be more than one fish per lane, randomize
      // which way the fish is swimming.
      newFish.faceLeft = Math.random() < 0.5 ? true : false;
      state.wordFish[lane] = newFish;
      fish = newFish;
      newFishGenerated = true;
    } else if (fish) {
      const swayValue = ((t * 360) / (20 * 1000)) % 360;
      const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 3) / 20;

      const xy = fish.getXY();
      if (!fish.startTime) {
        fish.startTime = t;
        fish.speed = randomInt(10, 15) * 1000;
      }
      let finalX;
      if (fish.faceLeft) {
        finalX =
          constants.canvasWidth +
          constants.fishCanvasWidth -
          (constants.canvasWidth / fish.speed) * (t - fish.startTime);
      } else {
        finalX =
          (constants.canvasWidth / fish.speed) * (t - fish.startTime) -
          constants.fishCanvasWidth;
      }
      const finalY = xy.y + swayOffsetY;
      fish.setXY({x: finalX, y: finalY});

      drawSingleFish(fish, finalX, finalY, ctx, fishScale);
    }
  });

  setState({fishCount});
};

const pondFishTransitionTime = 1500;
const totalPondFishXOffset = 1000;
// Draw the fish for pond mode.
const drawPondFishImages = () => {
  const state = getState();
  const ctx = state.canvas.getContext('2d');
  const fishes = state.showRecallFish ? state.recallFish : state.pondFish;

  let transitionOffset = 0;
  if (state.pondFishTransitionStartTime) {
    const t = $time() - state.pondFishTransitionStartTime;
    transitionOffset = (t / pondFishTransitionTime) * totalPondFishXOffset;

    if (t > pondFishTransitionTime) {
      setState({
        showRecallFish: !state.showRecallFish,
        pondFishTransitionStartTime: null
      });
    }
  }

  const fishBounds = [];

  // Draw all the unclicked fish first, then the clicked fish.
  [false, true].forEach(drawClickedFish => {
    fishes.forEach(fish => {
      const pondClickedFish = getState().pondClickedFish;
      const pondClickedFishUs = !!(
        pondClickedFish && fish.id === pondClickedFish.id
      );

      if (drawClickedFish === pondClickedFishUs) {
        const swayValue =
          (($time() * 360) / (20 * 1000) + (fish.getId() + 1) * 10) % 360;
        let swayOffsetX = Math.sin(((swayValue * Math.PI) / 180) * 2) * 25;
        let swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 2;

        // Add some variation to fish movement if transition is in progress.
        if (transitionOffset > 0 && fish.getId() % 2 === 0) {
          swayOffsetX *= 2;
          swayOffsetY *= 5;
        }

        const xy = fish.getXY();
        const finalX = xy.x + swayOffsetX + transitionOffset;
        const finalY = xy.y + swayOffsetY;

        const size = pondClickedFishUs ? 1 : 0.5;

        const fishBound = drawSingleFish(fish, finalX, finalY, ctx, size);

        // Record this screen location so that we can separately check for clicks on it.
        fishBounds.push({
          fishId: fish.id,
          ...fishBound
        });
      }
    });
  });

  setState({pondFishBounds: fishBounds}, {skipCallback: true});
};

// Draw a single fish, preferably from cached canvas.
// Used by drawMovingFish and drawPondFishImages.
// Takes an optional size multipler, where 0.5 means fish are half size.
// Returns an object with x, y, width and height of actual draw.
const drawSingleFish = (
  fish,
  fishXPos,
  fishYPos,
  ctx,
  size = 1,
  withPrediction = false,
  withPolaroid = false
) => {
  const [fishCanvas, hit] = canvasCache.getCanvas(fish.id);
  if (!hit) {
    fishCanvas.width = constants.fishCanvasWidth;
    fishCanvas.height = constants.fishCanvasHeight;
    fish.drawToCanvas(fishCanvas);
  }

  // TODO: Does scaling during drawImage have a performance impact on some
  // devices/browsers?  We might need to pre-cache scaled images.
  const width = fishCanvas.width * size;
  const height = fishCanvas.height * size;

  // Maintain the center of the fish.
  const adjustedFishXPos = fishXPos - width / 2 + fishCanvas.width / 2;
  const adjustedFishYPos = fishYPos - height / 2 + fishCanvas.height / 2;

  if (withPolaroid) {
    drawPolaroid(ctx, adjustedFishXPos, adjustedFishYPos, size);
  }

  if (withPrediction && fish.getResult()) {
    drawPrediction(
      ctx,
      adjustedFishXPos,
      adjustedFishYPos,
      fish.getResult().predictedClassId
    );
  }

  const finalX = Math.round(adjustedFishXPos);
  const finalY = Math.round(adjustedFishYPos);

  ctx.drawImage(fishCanvas, finalX, finalY, width, height);

  return {x: finalX, y: finalY, w: width, h: height};
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

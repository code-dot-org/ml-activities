import $ from 'jquery';
import constants, {Modes} from './constants';
import {init as initRenderer} from './renderer';
import {init as initTraining} from './modes/training';
import {init as initPredicting} from './modes/predicting';
import {init as initPond} from './modes/pond';
import {setState, getState} from './state';

$(document).ready(() => {
  let canvas = document.getElementById('activity-canvas');
  canvas.width = constants.canvasWidth;
  canvas.height = constants.canvasHeight;

  // Set up state
  const initialState = {
    currentMode: Modes.Training
  };
  setState(initialState);

  // Initialize renderer
  initRenderer(canvas);

  // Initialize current model
  initModel();

  // Periodically switch mode
  window.setInterval(() => {
    const currentMode = getState().currentMode;
    if (currentMode === Modes.Training) {
      setState({currentMode: Modes.Predicting});
    } else if (currentMode === Modes.Predicting) {
      setState({currentMode: Modes.Pond});
    } else if (currentMode === Modes.Pond) {
      setState({currentMode: Modes.Training});
    }

    // Initialize this new model.
    initModel();
  }, 4 * 1000);
});

// Initialize a model based on mode.
// Should only be called when mode changes.
function initModel() {
  switch (getState().currentMode) {
    case Modes.Training:
      initTraining();
      break;
    case Modes.Predicting:
      initPredicting();
      break;
    case Modes.Pond:
      initPond();
      break;
    default:
      console.error('No mode specified');
  }
}
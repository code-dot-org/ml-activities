import {init as initLoading} from './loading';
import {init as initWords} from './words';
import {init as initTraining} from './train';
import {init as initPredicting} from './predict';
import {init as initPond} from './pond';
import {Modes} from '../constants';

// Initialize a model (if that model has an `init` method) based on mode.
// Should only be called when mode changes.
export const init = state => {
  switch (state.currentMode) {
    case Modes.Loading:
      initLoading();
      break;
    case Modes.Words:
      initWords();
      break;
    case Modes.Training:
      initTraining();
      break;
    case Modes.Predicting:
      initPredicting();
      break;
    case Modes.Pond:
      initPond();
      break;
  }

  // Report a synthetic pageview to Google Analytics.
  if (window.ga) {
    const modeToPage = {
      [Modes.Loading]: 'loading',
      [Modes.Words]: 'words',
      [Modes.Training]: 'training',
      [Modes.Predicting]: 'predicting',
      [Modes.Pond]: 'pond',
      [Modes.Instructions]: 'instructions',
      [Modes.IntermediateLoading]: 'intermediateLoading'
    };

    const syntheticPagePath =
      window.location.pathname + '/' + modeToPage[state.currentMode];
    window.ga('set', 'page', syntheticPagePath);
    window.ga('send', 'pageview');
  }
};

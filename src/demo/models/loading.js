import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState} from '../state';
import {Modes} from '../constants';
import {initFishData} from '../../utils/fishData';
import XGBoostTrainer from '../../utils/XGBoostTrainer';
import {getAppMode} from '../helpers';
import {toMode} from '../toMode';

export const init = async () => {
  initFishData();
  await initRenderer();

  const trainer = new XGBoostTrainer();
  await trainer.init();

  const state = setState({currentMode: currentMode, trainer: trainer});
  const [appModeBase] = getAppMode(state);
  let mode;
  if (appModeBase === 'instructions') {
    mode = Modes.Instructions;
  } else if (appModeBase === 'fishvtrash') {
    mode = Modes.Training;
  } else {
    mode = Modes.Words;
  }
  toMode(mode);
};

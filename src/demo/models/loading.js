import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {setState} from '../state';
import {Modes} from '../constants';
import {init as initModel} from './index';
import {initFishData} from '../../utils/fishData';
import XGBoostTrainer from '../../utils/XGBoostTrainer';

export const init = async () => {
  initFishData();
  await initRenderer();
  const trainer = new XGBoostTrainer();
  await trainer.init();
  const state = setState({currentMode: Modes.ActivityIntro, trainer: trainer});
  initModel(state);
};

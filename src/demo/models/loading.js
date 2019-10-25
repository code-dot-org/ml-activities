import 'babel-polyfill';
import {initRenderer} from '../renderer';
import {setState} from '../state';
import {Modes} from '../constants';
import {init as initScene} from '../init';
import {initFishData} from '../../utils/fishData';
import {getUrlParamValue} from '../helpers';

export const init = async () => {
  initFishData();
  await initRenderer();
  const skipIntro = getUrlParamValue('skipIntro');
  const nextMode = skipIntro ? Modes.Words : Modes.ActivityIntro;
  setState({currentMode: nextMode});
  initScene();
};

import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';
import {initFishData} from '../../utils/fishData';
import {getAppMode, $time, finishLoading} from '../helpers';
import {toMode} from '../toMode';
import SimpleTrainer from '../../utils/SimpleTrainer';

export const init = async () => {
  const startTime = $time();

  const [appModeBase] = getAppMode(getState());

  const loadTrashImages = [
    AppMode.FishVTrash,
    AppMode.CreaturesVTrash,
    AppMode.CreaturesVTrashDemo
  ].includes(appModeBase);
  const loadCreatureImages = [
    AppMode.CreaturesVTrash,
    AppMode.CreaturesVTrashDemo
  ].includes(appModeBase);

  if (appModeBase === AppMode.CreaturesVTrashDemo) {
    const trainer = new SimpleTrainer(oceanObj => oceanObj.getTensor());
    setState({trainer, word: 'fish'});
  }

  setState({loadTrashImages, loadCreatureImages});

  initFishData();
  await initRenderer();

  let mode;
  if (appModeBase === 'instructions') {
    mode = Modes.Instructions;
  } else if (
    [AppMode.FishVTrash, AppMode.CreaturesVTrash].includes(appModeBase)
  ) {
    mode = Modes.Training;
  } else if (appModeBase === AppMode.CreaturesVTrashDemo) {
    mode = Modes.Predicting;
  } else {
    mode = Modes.Words;
  }

  // Ensure that we show the loading UI for at least 2 seconds, to avoid a flash.
  finishLoading(startTime, () => toMode(mode));
};
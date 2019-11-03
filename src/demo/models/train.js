import 'idempotent-babel-polyfill';
import {setState, getState} from '../state';
import {ClassType} from '../constants';
import SimpleTrainer from '../../utils/SimpleTrainer';
import XGBoostTrainer from '../../utils/XGBoostTrainer';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const state = getState();

  let fishData = [...state.fishData];
  if (fishData.length === 0) {
    fishData = fishData.concat(generateOcean(100, state.loadTrashImages));
  }

  let trainer = state.trainer;
  if (!trainer) {
    //trainer = new SimpleTrainer();
    trainer = new XGBoostTrainer();
    //trainer.initializeClassifiersWithoutMobilenet();
  }

  if (state.appMode === 'fishvtrash') {
    setState({
      word: 'Fish',
      trainingQuestion: 'Is this a fish?'
    });
  }

  setState({
    fishData,
    trainer,
    isRunning: true
  });
};

export const onClassifyFish = doesLike => {
  const state = getState();

  // No-op if animation is currently in progress.
  if (state.isRunning) {
    return;
  }

  //const knnData = state.fishData[state.trainingIndex].getTensor();
  const knnData = state.fishData[state.trainingIndex].knnData;
  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  //state.trainer.addExampleTensor(knnData, classId);
  state.trainer.addTrainingExample(knnData, classId);

  let fishData = [...state.fishData];
  if (state.trainingIndex > state.fishData.length - 5) {
    fishData = fishData.concat(generateOcean(100, state.loadTrashImages));
  }

  if (doesLike) {
    const newValue = getState().yesCount + 1;
    setState({yesCount: newValue});
  } else {
    const newValue = getState().noCount + 1;
    setState({noCount: newValue});
  }

  setState({
    trainingIndex: state.trainingIndex + 1,
    fishData,
    isRunning: true
  });
};

import 'idempotent-babel-polyfill';
import {getState, setState} from '../state';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const state = getState();
  state.trainer.train();
  const fishData = generateOcean(100, state.loadTrashImages);
  setState({isRunning: true, fishData});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];
    //state.trainer.predictFromTensor(fish.getTensor()).then(prediction => {
    state.trainer.predictFromExample(fish.knnData).then(prediction => {
      fish.setResult(prediction);
      resolve(prediction);
    });
  });
};

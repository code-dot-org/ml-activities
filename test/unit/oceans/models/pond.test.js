const {initFishData} = require('@ml/utils/fishData');
import {setState, getState, resetState} from '@ml/oceans/state';
import {TrashOceanObject} from '@ml/oceans/OceanObject';
import {ClassType, Modes} from '@ml/oceans/constants';
import {init} from '@ml/oceans/models/pond';
import KNNTrainer from '@ml/utils/KNNTrainer';
import {generateOcean} from '@ml/utils/generateOcean';

describe('Model quality test', () => {
  beforeAll(() => {
    initFishData();
  });

  beforeEach(() => {
    resetState();
    setState({
      trainer: new KNNTrainer(),
      mode: Modes.Pond,
      fishData: generateOcean(100, 0, true, true)
    });
  });

  test('init state without training', async () => {
    await init();
    const state = getState();
    expect(state).toBeTruthy();
    expect(state.pondFish).toBeTruthy();
    expect(state.pondFish.length).toBe(0);
    expect(state.recallFish).toBeTruthy();
    expect(state.recallFish.length).toBe(0);
  });

  test('init state with predictions', async () => {
    const trainer = new KNNTrainer();
    trainer.predict = jest.fn(async example => {
      if (example instanceof TrashOceanObject) {
        return {predictedClassId: 1, confidenceByClassId: {0: 0, 1: 1}};
      } else {
        return {predictedClassId: 0, confidenceByClassId: {0: 1, 1: 0}};
      }
    });
    setState({trainer});
    await init();
    const state = getState();
    expect(state).toBeTruthy();
    expect(state.pondFish).toBeTruthy();
    expect(state.pondFish.length).toBeGreaterThan(0);
    expect(state.recallFish).toBeTruthy();
    expect(state.recallFish.length).toBeGreaterThan(0);
  });
});

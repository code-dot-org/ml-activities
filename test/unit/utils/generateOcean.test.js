import {initFishData} from '../../../src/utils/fishData';
import {generateOcean, filterOcean} from '../../../src/utils/generateOcean';
import SimpleTrainer from '../../../src/utils/SimpleTrainer';

describe('Generate ocean test', () => {
  beforeAll(() => {
    initFishData();
  });

  test('Can generate ocean', () => {
    const numFish = 50;
    const ocean = generateOcean(numFish);
    expect(ocean.length).toEqual(numFish);
  });

  test('All fish in ocean have the same knn data length', () => {
    const numFish = 2000;
    const ocean = generateOcean(numFish);
    expect(ocean.length).toEqual(numFish);
    const knnDataLength = ocean[0].getKnnData().length;
    var knnDataSameLength = true;
    ocean.forEach(fish => {
      if (fish.getKnnData().length != knnDataLength) {
        knnDataSameLength = false;
      }
    });
    expect(knnDataSameLength);
  });

  test('Can generate predictions on a random set of fish', async () => {
    const numFish = 25;
    const trainingOcean = generateOcean(numFish);
    const trainer = new SimpleTrainer();
    await trainer.initializeClassifiersWithoutMobilenet();
    trainingOcean.forEach(fish => {
      trainer.addExampleTensor(fish.getTensor(), Math.round(Math.random()));
    });
    const predictedOcean = await filterOcean(generateOcean(numFish), trainer);
    expect(predictedOcean.length).toEqual(numFish);
  });

  test('Can predict red fish when only picking red fish', async () => {
    const numPredictionFish = 2000;
    const trainingOcean = generateOcean(50);
    const trainer = new SimpleTrainer();
    await trainer.initializeClassifiersWithoutMobilenet();
    trainingOcean.forEach(fish => {
      trainer.addExampleTensor(
        fish.getTensor(),
        fish.getColorPalette().bodyRgb[0] > 200 ? 1 : 0
      );
    });
    const predictedOcean = await filterOcean(
      generateOcean(numPredictionFish),
      trainer
    );
    const likedFish = predictedOcean.filter(fish => {
      return fish.result.predictedClassId === 1;
    });
    var numRedFish = 0;
    likedFish.forEach(fish => {
      if (fish.getColorPalette().bodyRgb[0] > 200) {
        numRedFish++;
      }
    });
    expect(predictedOcean.length).toEqual(numPredictionFish);
    expect((1.0 * numRedFish) / likedFish.length).toBeGreaterThanOrEqual(0.7);
  });

  test('Can predict round fish when only picking round fish', async () => {
    const numPredictionFish = 2000;
    const trainingOcean = generateOcean(50);
    const trainer = new SimpleTrainer();
    trainer.setTopK(5);
    await trainer.initializeClassifiersWithoutMobilenet();
    trainingOcean.forEach(fish => {
      const cat = fish.getKnnData()[1] === 0 ? 1 : 0;
      trainer.addExampleTensor(fish.getTensor(), cat);
    });
    const predictedOcean = await filterOcean(
      generateOcean(numPredictionFish),
      trainer
    );
    const likedFish = predictedOcean.filter(fish => {
      return fish.result.predictedClassId === 1;
    });
    var numRoundFish = 0;
    likedFish.forEach(fish => {
      if (fish.getKnnData()[1] === 0) {
        numRoundFish++;
      }
    });
    expect(predictedOcean.length).toEqual(numPredictionFish);
    expect((1.0 * numRoundFish) / likedFish.length).toBeGreaterThanOrEqual(0.7);
  });
});

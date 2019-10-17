const {
  generateOcean,
  generateRandomFish,
  filterOcean
} = require('../../src/utils/generateOcean');
const {FishTraits} = require('../../src/utils/fishData');
const SimpleTrainer = require('../../src/utils/SimpleTrainer');
const trainingFishJson = require('./data/trainingFish.json');
const _ = require('lodash');

describe('Generate ocean test', () => {
  test('Can generate ocean', () => {
    const numFish = 20;
    const ocean = generateOcean(numFish);
    expect(ocean.length).toEqual(numFish);
  });

  test('Can generate fish with trait', () => {
    const fish = generateRandomFish(FishTraits.ANGRY);
    var isAngry = false;
    fish.parts.forEach(part => {
      if (_.includes(part.traits, FishTraits.ANGRY)) {
        isAngry = true;
      }
    });
    expect(isAngry);
  });

  test('Can generate ocean with only angry fish', () => {
    const numFish = 20;
    const ocean = generateOcean(numFish, {[FishTraits.ANGRY]: 1.0});
    expect(ocean.length).toEqual(numFish);
    var numAngryFish = 0;
    ocean.forEach(fish => {
      fish.parts.forEach(part => {
        if (_.includes(part.traits, FishTraits.ANGRY)) {
          numAngryFish++;
        }
      });
    });
    expect(numAngryFish).toEqual(numFish);
  });

  test('Can generate ocean with some angry and some scary fish', () => {
    const numFish = 20;
    const ocean = generateOcean(numFish, {[FishTraits.ANGRY]: 0.25, [FishTraits.SCARY]: 0.25});
    expect(ocean.length).toEqual(numFish);
    var numAngryFish = 0;
    var numScaryFish = 0;
    ocean.forEach(fish => {
      fish.parts.forEach(part => {
        if (_.includes(part.traits, FishTraits.ANGRY)) {
          numAngryFish++;
        }
        if (_.includes(part.traits, FishTraits.SCARY)) {
          numScaryFish++;
        }
      });
    });
    expect(numAngryFish).toBeGreaterThanOrEqual(numFish * 0.25);
    expect(numScaryFish).toBeGreaterThanOrEqual(numFish * 0.25);
  });

  test('All fish in ocean have the same knn data length', () => {
    const numFish = 2000;
    const ocean = generateOcean(numFish);
    expect(ocean.length).toEqual(numFish);
    const knnDataLength = ocean[0].knnData.length;
    var knnDataSameLength = true;
    ocean.forEach(fish => {
      if (fish.knnData.length != knnDataLength) {
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
      trainer.addExampleData(fish.knnData, Math.round(Math.random()));
    });
    const predictedOcean = await filterOcean(generateOcean(numFish), trainer);
    expect(predictedOcean.length).toEqual(numFish);
  });

  test('Can predict red fish when only picking red fish', async () => {
    const numPredictionFish = 2000;
    const trainingOcean = trainingFishJson;
    const trainer = new SimpleTrainer();
    await trainer.initializeClassifiersWithoutMobilenet();
    trainingOcean.forEach(fish => {
      trainer.addExampleData(
        Array.from(fish.knnData),
        fish.colorPalette.bodyRgb[0] > 100 ? 1 : 0
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
      if (fish.colorPalette.bodyRgb[0] > 100) {
        numRedFish++;
      }
    });
    expect(predictedOcean.length).toEqual(numPredictionFish);
    expect((1.0 * numRedFish) / likedFish.length).toBeGreaterThanOrEqual(0.7);
  });

  test('Can predict round fish when only picking round fish', async () => {
    const numPredictionFish = 2000;
    const trainingOcean = trainingFishJson;
    const trainer = new SimpleTrainer();
    trainer.setTopK(5);
    await trainer.initializeClassifiersWithoutMobilenet();
    trainingOcean.forEach(fish => {
      const cat = fish.parts[0].knnData[0] > 0.5 ? 1 : 0;
      trainer.addExampleData(Array.from(fish.knnData), cat);
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
      if (fish.parts[0].knnData[0] > 0.5) {
        numRoundFish++;
      }
    });
    expect(predictedOcean.length).toEqual(numPredictionFish);
    expect((1.0 * numRoundFish) / likedFish.length).toBeGreaterThanOrEqual(0.7);
  });

  test('Can predict fish with long tails', async () => {
    const numPredictionFish = 2000;
    const trainingOcean = trainingFishJson;
    const trainer = new SimpleTrainer();
    trainer.setTopK(5);
    await trainer.initializeClassifiersWithoutMobilenet();
    trainingOcean.forEach(fish => {
      const cat = fish.parts[5].knnData[0] > 0.5 ? 1 : 0;
      trainer.addExampleData(Array.from(fish.knnData), cat);
    });
    const predictedOcean = await filterOcean(
      generateOcean(numPredictionFish),
      trainer
    );
    const likedFish = predictedOcean.filter(fish => {
      return fish.result.predictedClassId === 1;
    });
    var numLongTailedFish = 0;
    likedFish.forEach(fish => {
      if (fish.parts[5].knnData[0] > 0.5) {
        numLongTailedFish++;
      }
    });
    expect(predictedOcean.length).toEqual(numPredictionFish);
    expect((1.0 * numLongTailedFish) / likedFish.length).toBeGreaterThanOrEqual(
      0.65
    );
  });
});

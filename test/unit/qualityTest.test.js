const {
  initFishData,
  fishData,
  fieldInfos,
  MouthExpression,
  BodyShape
} = require('@ml/utils/fishData');
const {generateOcean, filterOcean} = require('@ml/utils/generateOcean');
const SVMTrainer = require('@ml/utils/SVMTrainer');
import {AppMode, ClassType} from '@ml/oceans/constants';
import {setState} from '@ml/oceans/state';

function clock(start) {
  if (!start) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round(end[0] * 1000 + end[1] / 1000000);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const trial = async function(trainSize, testSize, trainer, labelFn) {
  const trainingOcean = generateOcean(trainSize);
  const trainingLabels = trainingOcean.map(fish => labelFn(fish));

  const testOcean = generateOcean(testSize);

  for (const fish of trainingOcean) {
    const label = labelFn(fish);
    trainer.addTrainingExample(fish, label);
  }

  //const trainStart = clock();
  trainer.train();
  //console.log(`training latency: ${clock(trainStart)}`);

  for (const fish of testOcean) {
    fish.result = await trainer.predict(fish);
    //console.log(`${fish.result.predictedClassId === ClassType.Like ? 'Like' : 'Dislike'} Confidence: ${fish.result.confidencesByClassId[fish.result.predictedClassId]}`);
    //console.log(trainer.explainFish(fish));
  }

  //console.log(trainer.detailedExplanation(testOcean[0].fieldInfos));
  //console.log('Model summary:');
  //console.log(trainer.summarize(testOcean[0].fieldInfos));

  return createConfusionMatrix(testOcean, trainSize, labelFn);
};

const average = function(list) {
  const sum = list.reduce((prev, curr) => prev + curr);
  return (1.0 * sum) / list.length;
};

const performTrials = async function({
  numTrials,
  trainSize,
  testSize,
  createTrainerFn,
  labelFn
}) {
  const trials = [];

  if (!createTrainerFn) {
    createTrainerFn = () => {
      const trainer = new SVMTrainer(fish => fish.getKnnData());
      return trainer;
    };
  }

  //console.log(`${numTrials} trials`);
  for (var i = 0; i < numTrials; i++) {
    //console.log(`Trial # ${i + 1}`);
    trials.push(await trial(trainSize, testSize, createTrainerFn(), labelFn));
  }

  const averagedConfusionMatrix = {};
  const keys = [
    'truePos',
    'falsePos',
    'falseNeg',
    'trueNeg',
    'precision',
    'recall',
    'accuracy'
  ];

  for (const key of keys) {
    const values = trials.map(t => t[key]);
    const avg = average(values);
    averagedConfusionMatrix[key] = avg;
  }

  return averagedConfusionMatrix;
};

const createConfusionMatrix = function(predictedOcean, numTrained, labelFn) {
  var truePos, falsePos, falseNeg, trueNeg;
  truePos = falsePos = falseNeg = trueNeg = 0;

  for (const fish of predictedOcean) {
    const actualLabel = labelFn(fish) === ClassType.Like;
    const prediction = fish.result.predictedClassId === ClassType.Like;

    if (prediction && actualLabel) {
      truePos++;
    } else if (prediction && !actualLabel) {
      falsePos++;
    } else if (!prediction && actualLabel) {
      falseNeg++;
    } else {
      trueNeg++;
    }
  }

  const totalSize = truePos + falsePos + falseNeg + trueNeg;

  const precision = truePos / (truePos + falsePos);
  const recall = truePos / (truePos + falseNeg);
  const accuracy = (truePos + trueNeg) / totalSize;

  const confusionMatrix = {
    truePos: truePos,
    falsePos: falsePos,
    falseNeg: falseNeg,
    trueNeg: trueNeg,
    // If the model didn't predict "yes" for anything in the test data, precision is NaN.
    // We can assume there was at least one positive in the test data and call this 0 precision.
    precision: precision || 0,
    recall: recall,
    accuracy: accuracy
  };

  return confusionMatrix;
};

const analyzeConfusionMatrix = function(numTrained, cMatrix) {
  console.log(
    `Num Trained: ${numTrained} Precision: ${cMatrix.precision.toFixed(
      2
    )} Recall: ${cMatrix.recall.toFixed(
      2
    )} Accuracy: ${cMatrix.accuracy.toFixed(2)}\n` +
      `True Pos: ${cMatrix.truePos.toFixed(
        2
      )}\tFalse Pos: ${cMatrix.falsePos.toFixed(2)}\n` +
      `False Neg: ${cMatrix.falseNeg.toFixed(
        2
      )} True Neg: ${cMatrix.trueNeg.toFixed(2)}\n`
  );
};

const floatEquals = (a, b) => {
  return Math.abs(a - b) <= 0.0001;
};

const PartKey = Object.freeze({
  BODY: 'body',
  EYE: 'eye',
  MOUTH: 'mouth',
  PECTORAL_FIN_FRONT: 'pectoralFinFront',
  DORSAL_FIN: 'dorsalFin',
  TAIL: 'tail',
  COLOR: 'colors'
});

const NUM_TRIALS = 10;
const TRAIN_SIZE = 100;
const TEST_SIZE = 500;

describe('Model quality test', () => {
  beforeAll(() => {
    initFishData();
  });

  beforeEach(() => {
    setState({appMode: null});
  });

  test('Color test', async () => {
    const trainSize = TRAIN_SIZE;

    const idsByColor = {
      red: [6, 7],
      green: [2, 3],
      blue: [4, 5]
    };

    const colorMatch = (rgb, colorIds) => {
      const rgbs = Object.values(fishData.colors).map(color => color.rgb);

      let match = false;
      for (const id of colorIds) {
        if (rgbs[id] === rgb) {
          match = true;
          break;
        }
      }

      return match;
    };

    for (const [color, ids] of Object.entries(idsByColor)) {
      console.log(`${color}`);
      const labelFn = fish => {
        return colorMatch(fish.colorPalette.bodyRgb, ids)
          ? ClassType.Like
          : ClassType.Dislike;
      };
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.85);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('Fin color test', async () => {
    const trainSize = TRAIN_SIZE;

    const idsByColor = {
      red: [6, 7],
      green: [2, 3],
      blue: [4, 5]
    };

    const colorMatch = (rgb, colorIds) => {
      const rgbs = Object.values(fishData.colors).map(color => color.rgb);

      let match = false;
      for (const id of colorIds) {
        if (rgbs[id] === rgb) {
          match = true;
          break;
        }
      }

      return match;
    };

    for (const [color, ids] of Object.entries(idsByColor)) {
      console.log(`${color}`);
      const labelFn = fish => {
        return colorMatch(fish.colorPalette.finRgb, ids)
          ? ClassType.Like
          : ClassType.Dislike;
      };
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.85);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test eels with smiling mouths', async () => {
    setState({appMode: AppMode.FishLong});
    const trainSize = 300; // Need more fish to hit enough to train on
    const mouthData = fishData.mouths;
    const mouthKey = PartKey.MOUTH;
    const mouthNames = ['mouth15', 'mouth4', 'mouth5', 'mouth7', 'mouth8'];

    const bodyData = fishData.bodies;
    const bodyKey = PartKey.BODY;
    const bodyNames = ['s1'];

    const mouthIds = Object.entries(mouthData)
      .filter(entry => mouthNames.includes(entry[0]))
      .map(entry => entry[1].index);
    const bodyIds = Object.entries(bodyData)
      .filter(entry => bodyNames.includes(entry[0]))
      .map(entry => entry[1].index);
    console.log(
      `mouth names: ${JSON.stringify(mouthNames)} mouthIds: ${JSON.stringify(
        mouthIds
      )}`
    );
    console.log(
      `body names: ${JSON.stringify(bodyNames)} bodyIds: ${JSON.stringify(
        bodyIds
      )}`
    );

    const labelFn = fish =>
      mouthIds.includes(fish[mouthKey].index) &&
      bodyIds.includes(fish[bodyKey].index)
        ? ClassType.Like
        : ClassType.Dislike;

    const result = await performTrials({
      numTrials: 1,
      trainSize: trainSize,
      testSize: TEST_SIZE,
      labelFn: labelFn
    });
    analyzeConfusionMatrix(trainSize, result);
    expect(result.precision).toBeGreaterThanOrEqual(0.5);
    expect(result.recall).toBeGreaterThan(0); // very relaxed thresholds since this case is difficult to get right due to # of variations
  });

  test('Body shape test', async () => {
    const partKey = PartKey.BODY;
    const knnDataIndex = 1;
    const attribute = BodyShape;
    const trainSize = TRAIN_SIZE;

    for (const [shape, id] of Object.entries(attribute)) {
      console.log(`${shape}`);
      const normalizedId = (1.0 * id) / (Object.keys(attribute).length - 1);
      const labelFn = fish =>
        floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId)
          ? ClassType.Like
          : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.85);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test eyes', async () => {
    const partData = fishData.eyes;
    const partKey = PartKey.EYE;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish =>
        fish[partKey].index === id ? ClassType.Like : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.85);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test mouths', async () => {
    const partData = fishData.mouths;
    const partKey = PartKey.MOUTH;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish =>
        fish[partKey].index === id ? ClassType.Like : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.85);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test tails', async () => {
    const partData = fishData.tails;
    const partKey = PartKey.TAIL;
    const trainSize = 125;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish => {
        return fish[partKey].index === id ? ClassType.Like : ClassType.Dislike;
      };
      const result = await performTrials({
        numTrials: 5,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.65); // Lower threshold since it has no KNN data
      expect(result.recall).toBeGreaterThanOrEqual(0.25);
    }
  });

  test('test dorsal fins', async () => {
    const partData = fishData.dorsalFins;
    const partKey = PartKey.DORSAL_FIN;
    const trainSize = 125;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish => {
        return fish[partKey].index === id ? ClassType.Like : ClassType.Dislike;
      };
      const result = await performTrials({
        numTrials: 5,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.65); // Lower threshold since it has no KNN data
      expect(result.recall).toBeGreaterThanOrEqual(0.25);
    }
  });

  test('test mouth expressions', async () => {
    const partKey = PartKey.MOUTH;
    const knnDataIndex = 2;
    const trainSize = TRAIN_SIZE;

    for (const [expressionName, expressionId] of Object.entries(
      MouthExpression
    )) {
      console.log(`${partKey} ${expressionName}`);
      const normalizedId =
        (1.0 * expressionId) / (Object.keys(MouthExpression).length - 1);
      const labelFn = fish =>
        floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId)
          ? ClassType.Like
          : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.85);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test shark teeth', async () => {
    const partData = fishData.mouths;
    const partKey = PartKey.MOUTH;
    const trainSize = TRAIN_SIZE;
    const mouthNames = ['mouth3', 'mouth7'];

    const ids = Object.entries(partData)
      .filter(entry => mouthNames.includes(entry[0]))
      .map(entry => entry[1].index);
    console.log(
      `mouth names: ${JSON.stringify(mouthNames)} ids: ${JSON.stringify(ids)}`
    );

    const labelFn = fish =>
      ids.includes(fish[partKey].index) ? ClassType.Like : ClassType.Dislike;
    const result = await performTrials({
      numTrials: NUM_TRIALS,
      trainSize: trainSize,
      testSize: TEST_SIZE,
      labelFn: labelFn
    });
    analyzeConfusionMatrix(trainSize, result);
    expect(result.precision).toBeGreaterThanOrEqual(0.85);
    expect(result.recall).toBeGreaterThanOrEqual(0.5);
  });

  test('test SVM explanation', async () => {
    const partKey = PartKey.MOUTH;
    const knnDataIndex = 2;
    const expression = MouthExpression.SMILE;

    const trainer = new SVMTrainer(fish => fish.getKnnData());
    const normalizedId =
      (1.0 * expression) / (Object.keys(MouthExpression).length - 1);
    const labelFn = fish =>
      floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId)
        ? ClassType.Like
        : ClassType.Dislike;

    const trainingOcean = generateOcean(TRAIN_SIZE);
    const trainingLabels = trainingOcean.map(fish => labelFn(fish));

    const testOcean = generateOcean(TRAIN_SIZE);

    for (const fish of trainingOcean) {
      const label = labelFn(fish);
      trainer.addTrainingExample(fish, label);
    }

    trainer.train();

    const summary = trainer.summarize(trainingOcean[0].fieldInfos);
    console.log(summary);
    expect(summary[0].partType).toEqual('mouths'); // mouths should be most important since we're selecting for smiling fish
    var sum = 0;
    for (const entry of summary) {
      sum += entry.importance;
    }
    expect(sum).toBeCloseTo(1, 3); // Should add up to 1, allowing for floating point error

    for (const fish of testOcean) {
      // Sanity check our translation logic for removing bias term - should generate same predictions
      const predictResult = (await trainer.predict(fish)).predictedClassId;
      const translatedPredictResult = trainer.translatedPredict(
        fish.getKnnData()
      );
      expect(predictResult).toEqual(translatedPredictResult);

      // Mouths should have highest impact since we're selecting for smiling fish
      const predictionExplanation = trainer.explainFish(fish);
      expect(predictionExplanation[0].partType).toEqual('mouths');
    }
  });

  test('test SVM explanation fast fish', async () => {
    /* A more complex test case - the criteria is:
     * 1). All "fast bodies" are Like, all "slow bodies" are Dislike
     * 2). Of the bodies that are neither, "fast fins" are Like, and all other fins are Dislike
     * Also covers the case where a part without KNN data (dorsal fins) is used together with one that has it (bodies).
     */
    const finData = fishData.dorsalFins;
    const finKey = PartKey.DORSAL_FIN;
    const fastFins = [
      'dorsal_fin_2',
      'dorsal_fin_4',
      'dorsal_fin_10',
      'dorsal_fin_12'
    ];

    const bodyData = fishData.bodies;
    const bodyKey = PartKey.BODY;
    const fastBodies = ['diamond1', 'other_1', 'oval_4', 'rectangle_3'];
    const slowBodies = ['s1', 'triangle2', 'triangle3'];

    const fastFinIds = Object.entries(finData)
      .filter(entry => fastFins.includes(entry[0]))
      .map(entry => entry[1].index);
    const fastBodyIds = Object.entries(bodyData)
      .filter(entry => fastBodies.includes(entry[0]))
      .map(entry => entry[1].index);
    const slowBodyIds = Object.entries(bodyData)
      .filter(entry => slowBodies.includes(entry[0]))
      .map(entry => entry[1].index);

    console.log(`fast fin ids: ${JSON.stringify(fastFinIds)}`);
    console.log(
      `fast body ids: ${JSON.stringify(
        fastBodyIds
      )} slow body ids: ${JSON.stringify(slowBodyIds)}`
    );

    const labelFn = fish => {
      const finId = fish[finKey].index;
      const bodyId = fish[bodyKey].index;

      if (slowBodyIds.includes(bodyId)) {
        return ClassType.Dislike;
      } else if (fastBodyIds.includes(bodyId)) {
        return ClassType.Like;
      }

      return fastFinIds.includes(finId) ? ClassType.Like : ClassType.Dislike;
    };

    const accuracyTrainSize = 100;
    // Test model accuracy
    const result = await performTrials({
      numTrials: 1,
      trainSize: accuracyTrainSize,
      testSize: TEST_SIZE,
      labelFn: labelFn
    });
    analyzeConfusionMatrix(accuracyTrainSize, result);
    expect(result.precision).toBeGreaterThanOrEqual(0.7);
    expect(result.recall).toBeGreaterThanOrEqual(0.5);

    // Test explanation
    const explainTrainSize = 200;
    const trainer = new SVMTrainer(fish => fish.getKnnData());
    const trainingOcean = generateOcean(explainTrainSize);
    const trainingLabels = trainingOcean.map(fish => labelFn(fish));

    const testOcean = generateOcean(explainTrainSize);

    for (const fish of trainingOcean) {
      const label = labelFn(fish);
      trainer.addTrainingExample(fish, label);
    }

    trainer.train();

    const details = trainer.detailedExplanation(trainingOcean[0].fieldInfos);
    const summary = trainer.summarize(trainingOcean[0].fieldInfos);
    console.log(summary);
    const top_two = [summary[0].partType, summary[1].partType];
    expect(top_two).toContain('bodies');
    expect(top_two).toContain('dorsalFins');
  });
});

const xgbPromise = require('ml-xgboost');

export default class XGBoostTrainer {
  constructor() {
    this.labeledTrainingData = [];
    this.classes = new Set();
  }

  // TODO: clean up interface
  async init() {
    const XGBoost = await xgbPromise;
    this.booster = new XGBoost({
      booster: 'gbtree',
      objective: 'multi:softmax',
      max_depth: 5,
      eta: 0.1,
      min_child_weight: 1,
      subsample: 0.5,
      colsample_bytree: 1,
      silent: 1,
      iterations: 200
    });    
  }

  /**
   * @param {Array<number>} data
   * @param {number} classId
   */
  addTrainingExample(example, classId) {
    this.labeledTrainingData.push({example: example, label: classId});
    this.classes.add(classId);
  }

  getNumClasses() {
    return this.classes.size;
  }

  train() {
    const trainingData = this.labeledTrainingData.map(ld => ld.example);
    const trainingLabels = this.labeledTrainingData.map(ld => ld.label);
    this.booster.train(trainingData, trainingLabels);
  }

  /**
   * @param {Array<number>} data
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predictFromExample(example) {
    let result = {
      predictedClassId: null,
      confidencesByClassId: []
    };
    const numClasses = this.getNumClasses();
    if (numClasses > 0) {
      const res = this.booster.predict([example]);

      result.predictedClassId = res[0];

      const confidences = {};
      confidences[result.predictedClassId] = 1; // TODO: is it possible to get confidence values from XGBoost?
      result.confidencesByClassId = confidences;
    }
    return result;
  }
}
const svmjs = require('svm'); // https://github.com/karpathy/svmjs
import {ClassType} from '../demo/constants'

const SVM_PARAMS = {maxiter: 500}; // See https://github.com/karpathy/svmjs/blob/b75b71289dd81fc909a5b3fb8b1caf20fbe45121/lib/svm.js#L27

export default class SVMTrainer {
  constructor(converterFn) {
    this.converterFn = converterFn || (input => input); // Default to returning example as-is
    this.initTrainingState();
  }

  initTrainingState() {
    this.svm = new svmjs.SVM();
    this.labeledTrainingData = [];
    this.labelsSeen = new Set();
  }

  /**
   * @param {Array<number>} data
   * @param {number} classId
   */
  addTrainingExample(example, classId) {
    // This SVM library only accepts 1 and -1 as labels; convert from our 0/1 labeling scheme
    const convertedExample = this.converterFn(example);
    const svmLabel = CLASSTYPE_TO_SVM_LABEL[classId];
    this.labeledTrainingData.push({example: convertedExample, label: svmLabel});
    this.labelsSeen.add(svmLabel);
  }

  train() {
    if (this.labeledTrainingData.length > 1) {
      const trainingData = this.labeledTrainingData.map(ld => ld.example);
      const trainingLabels = this.labeledTrainingData.map(ld => ld.label);
      this.svm.train(trainingData, trainingLabels, SVM_PARAMS);
    }
  }

  /**
   * @param {Array<number>} data
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predict(example) {
    if (this.labeledTrainingData.length === 0) {
      return {
        predictedClassId: null,
        confidencesByClassId: {}
      };
    }

    let svmLabel, confidence;
    /* The SVM library we use doesn't work unless there's at least one training data point of each label.
     * If there's only one label among the training data, to keep behavior consistent with KNN, return that label. */
    if (this.labelsSeen.size === 1) {
      svmLabel = Array.from(this.labelsSeen)[0];
      confidence = 1;
    } else {
      const inputVector = this.converterFn(example);
      svmLabel = this.svm.predict([inputVector])[0];
      confidence = Math.abs(this.svm.marginOne(inputVector));
    }

    // This SVM library uses 1 and -1 as labels; convert back to our 0/1 labeling scheme
    const predictedClassId = SVM_LABEL_TO_CLASSTYPE[svmLabel];
    const confidences = {};
    confidences[predictedClassId] = confidence;

    return {
      predictedClassId: predictedClassId,
      confidencesByClassId: confidences
    };
  }

  clearAll() {
    this.initTrainingState();
  }

  /**
   * @param {Array<FieldInfo>} FieldInfos object which describes each field of the data the model was trained on.
   *  Currently this is generated by the Fish object, so each Fish object will have an identical fieldInfos field.
   * @returns {List<{fieldInfo: FieldInfo, absWeight: number}>} The absolute value of the weight of the trained model for each field.
   *  All absWeight values are real numbers >= 0.
   */
  detailedExplanation(fieldInfos) {
    const fieldsAndValues = [];
    for (var i = 0; i < this.svm.w.length; i++) {
      fieldsAndValues.push({
        fieldInfo: fieldInfos[i],
        absWeight: Math.abs(this.svm.w[i]),
        sign: this.svm.w[i] >= 0 ? 1 : -1
      });
    }
    fieldsAndValues.sort((a, b) => b.absWeight - a.absWeight);
    return fieldsAndValues;
  }

  /**
   * @param {Array<FieldInfo>} FieldInfos object which describes each field of the data the model was trained on.
   *  Currently this is generated by the Fish object, so each Fish object will have an identical fieldInfos field.
   * @returns {List<{partType: string, importance: number}>} A summary of the importance of each part type (mouth, eyes, etc.) to the model.
   *  All importance values are real numbers >= 0. Returns null if there is no useful summary info, which happens when there is < 2 data points,
   *  or there was only one class among training data labels.
   */
  summarize(fieldInfos) {
    if (!this.hasNontrivialModel()) {
      return null;
    }

    const weightData = this.detailedExplanation(fieldInfos);
    /* separate the "id" fields, which are the fields generated by one-hot encoding the variation id for each part, with the "attribute"
     * fields, which are the hand-crafted metadata values such as number of teeth, since we need to treat the two differently in the summary. */
    const idFields = weightData.filter(d => d.fieldInfo.fieldType === 'id');
    const attributeFields = weightData.filter(
      d => d.fieldInfo.fieldType === 'attribute'
    );

    /* Aggregate all the fields generated by one-hot encoding back into one per part, since we don't want the number of variations for a part
     * to influence its weight.
     * Aggregate by picking the maximum value per part, since only one of these fields can be "used" for a particular input.
     * This is a heuristic from experimenting and seeing what "looks right", may not be ideal in all cases. - @winter */
    const idFieldsSummary = {};
    for (const fieldWithWeight of idFields) {
      const partType = fieldWithWeight.fieldInfo.partType;
      if (
        !Object.prototype.hasOwnProperty.call(idFieldsSummary, partType) ||
        fieldWithWeight.absWeight > idFieldsSummary[partType]
      ) {
        idFieldsSummary[partType] = fieldWithWeight.absWeight;
      }
    }

    // Sum all of the weights per part from the attribute fields and the idFieldsSummary. Result is a map of partType: totalAbsWeight.
    const rawSummary = {};
    for (const fieldWithWeight of attributeFields) {
      const partType = fieldWithWeight.fieldInfo.partType;
      if (!Object.prototype.hasOwnProperty.call(rawSummary, partType)) {
        rawSummary[partType] = 0;
      }
      rawSummary[partType] += fieldWithWeight.absWeight;
    }
    for (const [partType, weight] of Object.entries(idFieldsSummary)) {
      if (!Object.prototype.hasOwnProperty.call(rawSummary, partType)) {
        rawSummary[partType] = 0;
      }
      rawSummary[partType] += weight;
    }

    // Sort entries and convert to return format.
    const sortedSummary = Object.entries(rawSummary)
      .map(e => {
        return {partType: e[0], importance: e[1]};
      })
      .sort((a, b) => b.importance - a.importance);

    // Normalize importance such that all of the importance values add up to 1. This lets us use results as percentages if we want.
    var denominator = 0;
    for (const partWithImportance of sortedSummary) {
      denominator += partWithImportance.importance;
    }
    const sortedAndNormalizedSummary = sortedSummary.map(p => {
      return {partType: p.partType, importance: p.importance / denominator};
    });
    return sortedAndNormalizedSummary;
  }

  /**
   * @param {Fish} Fish object to explain the model's prediction for.
   *  Currently this is generated by the Fish object, so each Fish object will have an identical fieldInfos field.
   * @returns {List<{partType: string, impact: number}>} A summary of the impact of each part type (mouth, eyes, etc.) on the prediction
   *  result for this specific fish. Impact can be a positive or negative real number - a larger absolute value means more impact. A negative
   *  impact means it contributed to a "Like" and a positive impact means it contributed to a "Dislike". Returns null if there is no useful
   *  summary info, which happens when there is < 2 data points, or there was only one class among training data labels.
   */
  explainFish(fish) {
    if (!this.hasNontrivialModel()) {
      return null;
    }

    /* Translate the fish's data to "remove" the bias term from the model. The relative weights for each field don't always correspond to
     * contribution to prediction with a high bias value, which will happen for skewed data sets. */
    const translatedVector = this.removeBiasTranslate(fish.knnData);

    const impactByPart = {};
    for (var i = 0; i < this.svm.w.length; i++) {
      const partType = fish.fieldInfos[i].partType;
      if (!Object.prototype.hasOwnProperty.call(impactByPart, partType)) {
        impactByPart[partType] = 0;
      }

      impactByPart[partType] += this.svm.w[i] * translatedVector[i];
    }

    const sortedImpact = Object.entries(impactByPart)
      .map(e => {
        return {partType: e[0], impact: e[1]};
      })
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return sortedImpact;
  }

  /* Translates the given input vector such that the model would give the same prediction without its bias term.
   * Used so we can explain the importance of each feature without the concepot of bias.
   */
  removeBiasTranslate(vector) {
    // For bias term b, model weights a = [a1, a2, ... ad] and input vector [x1, x2, ... xd], the translation vector we add to
    // the original vector is (b / ||a||^2) * a. The intuition is that we are translating the separating hyperplane along its perpendicular
    // vector until it intersects with the origin, and applying the same translation to the input vector.
    const translationConstant = this.svm.b / magnitude_squared(this.svm.w);
    const translationVector = this.svm.w.map(x => x * translationConstant);

    const result = [];
    for (var i = 0; i < vector.length; i++) {
      result[i] = vector[i] + translationVector[i];
    }
    return result;
  }

  // Only needed for testing / validation of removeBiasTranslate
  translatedPredict(vector) {
    const translatedVector = this.removeBiasTranslate(vector);
    var margin = 0;
    for (var i = 0; i < translatedVector.length; i++) {
      margin += this.svm.w[i] * translatedVector[i];
    }
    return margin > 0 ? 1 : 0;
  }

  hasNontrivialModel() {
    // If we have a weight vector and it has at least one nonzero value, return true, otherwise return false
    return this.svm.w && this.svm.w.find(weight => weight !== 0);
  }
}

const CLASSTYPE_TO_SVM_LABEL = {
  [ClassType.Like]: -1,
  [ClassType.Dislike]: 1
};
const SVM_LABEL_TO_CLASSTYPE = {
  [-1]: ClassType.Like,
  [1]: ClassType.Dislike
};

// helper function - returns ||v|||^2 for input vector v
const magnitude_squared = vector => {
  var sum = 0;
  for (const x of vector) {
    sum += Math.pow(x, 2);
  }
  return sum;
};

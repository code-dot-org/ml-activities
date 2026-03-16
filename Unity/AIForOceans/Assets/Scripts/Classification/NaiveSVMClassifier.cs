using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Naive SVM-like classifier using weighted attribute matching
    /// Replaces TensorFlow SVM without actual ML
    /// Used for word modes (short/long) where we classify by attributes
    /// </summary>
    public class NaiveSVMClassifier : ITrainer
    {
        private List<TrainingExample> yesExamples = new List<TrainingExample>();
        private List<TrainingExample> noExamples = new List<TrainingExample>();

        // Learned weights for each feature (after training)
        private float[] featureWeights;
        private float bias = 0f;
        private bool isTrained = false;

        private struct TrainingExample
        {
            public OceanObjectData data;
            public float[] features;
        }

        public void AddExample(OceanObjectData data, GameConstants.ClassLabel label)
        {
            var example = new TrainingExample
            {
                data = data,
                features = data.ToFeatureVector()
            };

            if (label == GameConstants.ClassLabel.Yes)
            {
                yesExamples.Add(example);
            }
            else
            {
                noExamples.Add(example);
            }

            isTrained = false; // Need to retrain
        }

        /// <summary>
        /// Train the classifier by computing feature weights
        /// This is a simplified version - real SVM uses optimization
        /// </summary>
        public void Train()
        {
            if (yesExamples.Count == 0 || noExamples.Count == 0)
            {
                // Can't train without both classes
                isTrained = false;
                return;
            }

            int featureCount = yesExamples[0].features.Length;
            featureWeights = new float[featureCount];

            // Calculate mean feature values for each class
            float[] yesMean = CalculateMean(yesExamples);
            float[] noMean = CalculateMean(noExamples);

            // Weights are the difference between means
            // Features that differ more between classes get higher weight
            for (int i = 0; i < featureCount; i++)
            {
                featureWeights[i] = yesMean[i] - noMean[i];
            }

            // Normalize weights
            float weightSum = featureWeights.Sum(w => Mathf.Abs(w));
            if (weightSum > 0)
            {
                for (int i = 0; i < featureCount; i++)
                {
                    featureWeights[i] /= weightSum;
                }
            }

            // Calculate bias as the midpoint
            float yesScore = CalculateScore(yesMean);
            float noScore = CalculateScore(noMean);
            bias = -(yesScore + noScore) / 2f;

            isTrained = true;
        }

        public (bool prediction, float confidence) Predict(OceanObjectData data)
        {
            if (!isTrained)
            {
                // Fall back to simple similarity if not trained
                return PredictBySimilarity(data);
            }

            float[] features = data.ToFeatureVector();
            float score = CalculateScore(features) + bias;

            // Positive score = Yes, Negative score = No
            bool prediction = score >= 0;

            // Confidence based on distance from decision boundary
            float confidence = Mathf.Clamp01(Mathf.Abs(score) * 2f);

            return (prediction, confidence);
        }

        /// <summary>
        /// Calculate weighted score for features
        /// </summary>
        private float CalculateScore(float[] features)
        {
            float score = 0;
            int len = Mathf.Min(features.Length, featureWeights.Length);

            for (int i = 0; i < len; i++)
            {
                score += features[i] * featureWeights[i];
            }

            return score;
        }

        /// <summary>
        /// Calculate mean feature vector
        /// </summary>
        private float[] CalculateMean(List<TrainingExample> examples)
        {
            if (examples.Count == 0)
                return new float[0];

            int featureCount = examples[0].features.Length;
            float[] mean = new float[featureCount];

            foreach (var example in examples)
            {
                for (int i = 0; i < featureCount; i++)
                {
                    mean[i] += example.features[i];
                }
            }

            for (int i = 0; i < featureCount; i++)
            {
                mean[i] /= examples.Count;
            }

            return mean;
        }

        /// <summary>
        /// Fallback prediction using simple similarity
        /// </summary>
        private (bool prediction, float confidence) PredictBySimilarity(OceanObjectData data)
        {
            if (yesExamples.Count == 0 && noExamples.Count == 0)
            {
                return (true, 0.5f);
            }

            float[] queryFeatures = data.ToFeatureVector();

            float yesAvgDist = yesExamples.Count > 0
                ? yesExamples.Average(e => CalculateDistance(queryFeatures, e.features))
                : float.MaxValue;

            float noAvgDist = noExamples.Count > 0
                ? noExamples.Average(e => CalculateDistance(queryFeatures, e.features))
                : float.MaxValue;

            bool prediction = yesAvgDist <= noAvgDist;
            float totalDist = yesAvgDist + noAvgDist;
            float confidence = totalDist > 0
                ? Mathf.Abs(yesAvgDist - noAvgDist) / totalDist
                : 0.5f;

            return (prediction, confidence);
        }

        /// <summary>
        /// Calculate Euclidean distance
        /// </summary>
        private float CalculateDistance(float[] a, float[] b)
        {
            int minLen = Mathf.Min(a.Length, b.Length);
            float sum = 0;

            for (int i = 0; i < minLen; i++)
            {
                sum += Mathf.Pow(a[i] - b[i], 2);
            }

            return Mathf.Sqrt(sum);
        }

        public int GetExampleCount(GameConstants.ClassLabel label)
        {
            return label == GameConstants.ClassLabel.Yes ? yesExamples.Count : noExamples.Count;
        }

        public void ClearAll()
        {
            yesExamples.Clear();
            noExamples.Clear();
            featureWeights = null;
            bias = 0f;
            isTrained = false;
        }

        /// <summary>
        /// Get feature weights for visualization (like original SVM)
        /// </summary>
        public float[] GetFeatureWeights()
        {
            return featureWeights ?? new float[0];
        }

        /// <summary>
        /// Get feature importance for a specific prediction
        /// </summary>
        public Dictionary<string, float> GetFeatureImportance()
        {
            if (featureWeights == null)
                return new Dictionary<string, float>();

            var importance = new Dictionary<string, float>
            {
                { "body", Mathf.Abs(featureWeights[0]) },
                { "eyes", Mathf.Abs(featureWeights[1]) },
                { "mouth", Mathf.Abs(featureWeights[2]) },
                { "dorsalFin", Mathf.Abs(featureWeights[3]) },
                { "pectoralFin", Mathf.Abs(featureWeights[4]) },
                { "tailFin", Mathf.Abs(featureWeights[5]) },
                { "primaryColor", (Mathf.Abs(featureWeights[6]) + Mathf.Abs(featureWeights[7]) + Mathf.Abs(featureWeights[8])) / 3f },
                { "secondaryColor", (Mathf.Abs(featureWeights[9]) + Mathf.Abs(featureWeights[10]) + Mathf.Abs(featureWeights[11])) / 3f },
                { "finColor", (Mathf.Abs(featureWeights[12]) + Mathf.Abs(featureWeights[13]) + Mathf.Abs(featureWeights[14])) / 3f }
            };

            return importance;
        }
    }
}

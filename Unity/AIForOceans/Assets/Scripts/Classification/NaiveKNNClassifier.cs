using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Naive K-Nearest Neighbors classifier using attribute matching
    /// Replaces TensorFlow.js KNN without actual ML
    /// </summary>
    public class NaiveKNNClassifier : ITrainer
    {
        private List<TrainingExample> yesExamples = new List<TrainingExample>();
        private List<TrainingExample> noExamples = new List<TrainingExample>();
        private int k = 3; // Number of neighbors to consider

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
        }

        public void Train()
        {
            // KNN doesn't need explicit training - it's instance-based
        }

        public (bool prediction, float confidence) Predict(OceanObjectData data)
        {
            if (yesExamples.Count == 0 && noExamples.Count == 0)
            {
                return (true, 0.5f); // No training data, random guess
            }

            float[] queryFeatures = data.ToFeatureVector();

            // Calculate distances to all examples
            var distances = new List<(float distance, bool isYes)>();

            foreach (var example in yesExamples)
            {
                float dist = CalculateDistance(queryFeatures, example.features);
                distances.Add((dist, true));
            }

            foreach (var example in noExamples)
            {
                float dist = CalculateDistance(queryFeatures, example.features);
                distances.Add((dist, false));
            }

            // Sort by distance and take k nearest
            var nearest = distances
                .OrderBy(d => d.distance)
                .Take(Mathf.Min(k, distances.Count))
                .ToList();

            // Count votes
            int yesVotes = nearest.Count(n => n.isYes);
            int noVotes = nearest.Count - yesVotes;

            bool prediction = yesVotes >= noVotes;
            float confidence = Mathf.Max(yesVotes, noVotes) / (float)nearest.Count;

            // Adjust confidence based on distance
            if (nearest.Count > 0)
            {
                float avgDistance = nearest.Average(n => n.distance);
                // Lower distance = higher confidence
                confidence *= Mathf.Clamp01(1f - avgDistance);
            }

            return (prediction, confidence);
        }

        /// <summary>
        /// Calculate Euclidean distance between feature vectors
        /// </summary>
        private float CalculateDistance(float[] a, float[] b)
        {
            if (a.Length != b.Length)
            {
                // Handle different vector lengths
                int minLen = Mathf.Min(a.Length, b.Length);
                float sum = 0;
                for (int i = 0; i < minLen; i++)
                {
                    sum += Mathf.Pow(a[i] - b[i], 2);
                }
                return Mathf.Sqrt(sum);
            }

            float distance = 0;
            for (int i = 0; i < a.Length; i++)
            {
                distance += Mathf.Pow(a[i] - b[i], 2);
            }
            return Mathf.Sqrt(distance);
        }

        public int GetExampleCount(GameConstants.ClassLabel label)
        {
            return label == GameConstants.ClassLabel.Yes ? yesExamples.Count : noExamples.Count;
        }

        public void ClearAll()
        {
            yesExamples.Clear();
            noExamples.Clear();
        }

        /// <summary>
        /// Set the number of neighbors to consider
        /// </summary>
        public void SetK(int newK)
        {
            k = Mathf.Max(1, newK);
        }
    }
}

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Controls the prediction scene flow
    /// </summary>
    public class PredictionSceneController : MonoBehaviour
    {
        [Header("References")]
        public FishRenderer fishRenderer;
        public FishAnimator fishAnimator;
        public AIBot aiBot;
        public PredictionUI predictionUI;

        [Header("Animation Settings")]
        public Vector2 spawnPosition = new Vector2(-200f, 0f);
        public Vector2 scanPosition = new Vector2(0f, 0f);
        public Vector2 exitPosition = new Vector2(200f, 0f);
        public float swimSpeed = 100f;
        public float scanDuration = 1.5f;
        public float delayBetweenFish = 0.5f;

        [Header("Prediction Settings")]
        public int fishToPredictCount = 20;

        private Queue<OceanObjectData> fishQueue;
        private bool isRunning = false;
        private int predictedCount = 0;

        private void OnEnable()
        {
            StartPredictions();
        }

        private void OnDisable()
        {
            StopPredictions();
        }

        /// <summary>
        /// Start the prediction sequence
        /// </summary>
        public void StartPredictions()
        {
            if (isRunning) return;

            var state = GameManager.Instance.State;

            // Get fish for prediction (skip training fish)
            fishQueue = new Queue<OceanObjectData>();
            int startIndex = state.totalTrainingCount;

            for (int i = startIndex; i < state.fishData.Count && i < startIndex + fishToPredictCount; i++)
            {
                fishQueue.Enqueue(state.fishData[i]);
            }

            predictedCount = 0;
            isRunning = true;

            StartCoroutine(RunPredictionLoop());
        }

        /// <summary>
        /// Stop predictions
        /// </summary>
        public void StopPredictions()
        {
            isRunning = false;
            StopAllCoroutines();
        }

        /// <summary>
        /// Main prediction loop
        /// </summary>
        private IEnumerator RunPredictionLoop()
        {
            while (isRunning && fishQueue.Count > 0)
            {
                OceanObjectData fish = fishQueue.Dequeue();
                yield return StartCoroutine(ProcessFish(fish));
                yield return new WaitForSeconds(delayBetweenFish);
            }

            // All predictions complete
            isRunning = false;
            OnAllPredictionsComplete();
        }

        /// <summary>
        /// Process a single fish through prediction
        /// </summary>
        private IEnumerator ProcessFish(OceanObjectData fish)
        {
            // Set up fish visual
            if (fishRenderer != null && fish.objectType == GameConstants.OceanObjectType.Fish)
            {
                fishRenderer.SetupFish(fish);
            }

            // Swim in from left
            yield return StartCoroutine(SwimTo(spawnPosition, scanPosition, 1f));

            // AI scans the fish
            if (aiBot != null)
            {
                aiBot.SetExpression(AIBot.Expression.Scanning);
            }

            if (predictionUI != null)
            {
                predictionUI.ShowScanning();
            }

            // Play scan sound
            if (SoundManager.Instance != null)
            {
                SoundManager.Instance.PlayScan();
            }

            // Wait for scan
            yield return new WaitForSeconds(scanDuration);

            // Make prediction
            PredictionResult result = GameManager.Instance.MakePrediction(fish);
            predictedCount++;

            // AI reacts
            if (aiBot != null)
            {
                aiBot.SetExpression(result.prediction ? AIBot.Expression.Yes : AIBot.Expression.No);
            }

            // Brief pause to show result
            yield return new WaitForSeconds(0.5f);

            // Swim out
            yield return StartCoroutine(SwimTo(scanPosition, exitPosition, 0.5f));
        }

        /// <summary>
        /// Animate swimming from one position to another
        /// </summary>
        private IEnumerator SwimTo(Vector2 from, Vector2 to, float duration)
        {
            if (fishRenderer == null) yield break;

            Transform fishTransform = fishRenderer.transform;
            fishTransform.position = from;

            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = FishAnimator.SCurve(elapsed / duration);
                fishTransform.position = Vector2.Lerp(from, to, t);
                yield return null;
            }

            fishTransform.position = to;
        }

        /// <summary>
        /// Called when all predictions are complete
        /// </summary>
        private void OnAllPredictionsComplete()
        {
            // Hide prediction UI
            if (predictionUI != null)
            {
                predictionUI.Hide();
            }

            // Move to pond scene
            GameManager.Instance.ShowResults();
        }

        /// <summary>
        /// Skip to results immediately
        /// </summary>
        public void SkipToResults()
        {
            StopPredictions();

            // Make remaining predictions instantly
            while (fishQueue != null && fishQueue.Count > 0)
            {
                OceanObjectData fish = fishQueue.Dequeue();
                GameManager.Instance.MakePrediction(fish);
            }

            OnAllPredictionsComplete();
        }
    }
}

using System;
using System.Collections.Generic;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Central game state - mirrors the original state.js
    /// </summary>
    [Serializable]
    public class GameState
    {
        // Current mode and scene
        public GameConstants.AppMode appMode = GameConstants.AppMode.FishVTrash;
        public GameConstants.GameScene currentScene = GameConstants.GameScene.Loading;

        // Training state
        public int trainingIndex = 0;
        public int totalTrainingCount = 0;
        public string selectedWord = "";

        // Fish/object data
        public List<OceanObjectData> fishData = new List<OceanObjectData>();
        public List<PredictionResult> pondResults = new List<PredictionResult>();

        // Animation state
        public bool isRunning = false;
        public bool isPaused = false;
        public float currentTime = 0f;

        // UI state
        public bool guideShowing = false;
        public int guideIndex = 0;
        public OceanObjectData selectedPondFish = null;

        // Trainer reference (set at runtime)
        [NonSerialized]
        public ITrainer trainer;

        /// <summary>
        /// Reset state for a new game
        /// </summary>
        public void Reset()
        {
            trainingIndex = 0;
            fishData.Clear();
            pondResults.Clear();
            isRunning = false;
            isPaused = false;
            currentTime = 0f;
            guideShowing = false;
            guideIndex = 0;
            selectedPondFish = null;
            trainer?.ClearAll();
        }

        /// <summary>
        /// Get training count for current mode
        /// </summary>
        public int GetTrainingCountForMode()
        {
            return appMode switch
            {
                GameConstants.AppMode.FishVTrash => GameConstants.FISH_V_TRASH_TRAINING_COUNT,
                GameConstants.AppMode.CreaturesVTrashDemo => 0, // No training in demo
                GameConstants.AppMode.CreaturesVTrash => GameConstants.CREATURES_V_TRASH_TRAINING_COUNT,
                GameConstants.AppMode.Short => GameConstants.SHORT_TRAINING_COUNT,
                GameConstants.AppMode.Long => GameConstants.LONG_TRAINING_COUNT,
                _ => 6
            };
        }
    }

    /// <summary>
    /// Result of a prediction
    /// </summary>
    [Serializable]
    public class PredictionResult
    {
        public OceanObjectData objectData;
        public bool prediction;
        public float confidence;
        public bool isCorrect;

        public PredictionResult(OceanObjectData data, bool pred, float conf)
        {
            objectData = data;
            prediction = pred;
            confidence = conf;
            isCorrect = false; // Set based on context
        }
    }
}

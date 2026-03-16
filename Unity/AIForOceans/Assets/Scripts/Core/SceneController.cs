using System;
using System.Collections;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Handles scene/mode transitions and UI management
    /// </summary>
    public class SceneController : MonoBehaviour
    {
        // References to scene UI containers (set in inspector or found at runtime)
        public GameObject loadingUI;
        public GameObject wordsUI;
        public GameObject trainingUI;
        public GameObject predictingUI;
        public GameObject pondUI;
        public GameObject intermediateLoadingUI;

        // Current active scene
        private GameConstants.GameScene currentScene;

        private void Start()
        {
            // Subscribe to scene changes
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnSceneChanged += HandleSceneChange;
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnSceneChanged -= HandleSceneChange;
            }
        }

        /// <summary>
        /// Handle scene change events
        /// </summary>
        private void HandleSceneChange(GameConstants.GameScene newScene)
        {
            StartCoroutine(TransitionToScene(newScene));
        }

        /// <summary>
        /// Transition to a new scene with optional fade
        /// </summary>
        private IEnumerator TransitionToScene(GameConstants.GameScene newScene)
        {
            // Hide current scene
            HideAllScenes();

            // Small delay for transition effect
            yield return new WaitForSeconds(0.1f);

            // Show new scene
            currentScene = newScene;
            ShowScene(newScene);

            // Initialize scene-specific logic
            InitializeScene(newScene);
        }

        /// <summary>
        /// Hide all scene UIs
        /// </summary>
        private void HideAllScenes()
        {
            SetActiveIfNotNull(loadingUI, false);
            SetActiveIfNotNull(wordsUI, false);
            SetActiveIfNotNull(trainingUI, false);
            SetActiveIfNotNull(predictingUI, false);
            SetActiveIfNotNull(pondUI, false);
            SetActiveIfNotNull(intermediateLoadingUI, false);
        }

        /// <summary>
        /// Show specific scene UI
        /// </summary>
        private void ShowScene(GameConstants.GameScene scene)
        {
            switch (scene)
            {
                case GameConstants.GameScene.Loading:
                    SetActiveIfNotNull(loadingUI, true);
                    break;
                case GameConstants.GameScene.Words:
                    SetActiveIfNotNull(wordsUI, true);
                    break;
                case GameConstants.GameScene.Training:
                    SetActiveIfNotNull(trainingUI, true);
                    break;
                case GameConstants.GameScene.Predicting:
                    SetActiveIfNotNull(predictingUI, true);
                    break;
                case GameConstants.GameScene.Pond:
                    SetActiveIfNotNull(pondUI, true);
                    break;
                case GameConstants.GameScene.IntermediateLoading:
                    SetActiveIfNotNull(intermediateLoadingUI, true);
                    break;
            }
        }

        /// <summary>
        /// Initialize scene-specific behavior
        /// </summary>
        private void InitializeScene(GameConstants.GameScene scene)
        {
            switch (scene)
            {
                case GameConstants.GameScene.Loading:
                    StartCoroutine(HandleLoading());
                    break;
                case GameConstants.GameScene.IntermediateLoading:
                    StartCoroutine(HandleIntermediateLoading());
                    break;
                case GameConstants.GameScene.Predicting:
                    // Start prediction animation
                    break;
            }
        }

        /// <summary>
        /// Handle initial loading
        /// </summary>
        private IEnumerator HandleLoading()
        {
            // Simulate asset loading
            yield return new WaitForSeconds(1f);

            // Move to next appropriate scene
            var state = GameManager.Instance.State;
            if (state.appMode == GameConstants.AppMode.Short ||
                state.appMode == GameConstants.AppMode.Long)
            {
                GameManager.Instance.ChangeScene(GameConstants.GameScene.Words);
            }
            else
            {
                GameManager.Instance.ChangeScene(GameConstants.GameScene.Training);
            }
        }

        /// <summary>
        /// Handle intermediate loading (SVM training)
        /// </summary>
        private IEnumerator HandleIntermediateLoading()
        {
            // Show loading while "training" happens
            yield return new WaitForSeconds(1.5f);

            // Move to prediction
            GameManager.Instance.ChangeScene(GameConstants.GameScene.Predicting);
        }

        private void SetActiveIfNotNull(GameObject obj, bool active)
        {
            if (obj != null)
            {
                obj.SetActive(active);
            }
        }
    }
}

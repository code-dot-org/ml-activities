using System;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Main game manager singleton - handles state and scene transitions
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        // Events for state changes
        public event Action<GameConstants.GameScene> OnSceneChanged;
        public event Action<GameState> OnStateChanged;
        public event Action<OceanObjectData, bool> OnTrainingExampleAdded;
        public event Action<PredictionResult> OnPredictionMade;

        // Current game state
        public GameState State { get; private set; }

        // Scene controller reference
        private SceneController sceneController;

        private void Awake()
        {
            // Singleton pattern
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            // Initialize state
            State = new GameState();
        }

        private void Start()
        {
            sceneController = GetComponent<SceneController>();
            if (sceneController == null)
            {
                sceneController = gameObject.AddComponent<SceneController>();
            }
        }

        /// <summary>
        /// Start a new game with the specified mode
        /// </summary>
        public void StartGame(GameConstants.AppMode mode)
        {
            State.Reset();
            State.appMode = mode;
            State.totalTrainingCount = State.GetTrainingCountForMode();

            // Initialize appropriate trainer
            InitializeTrainer();

            // Generate initial fish data
            GenerateFishData();

            // Start with loading or words scene
            if (mode == GameConstants.AppMode.Short || mode == GameConstants.AppMode.Long)
            {
                ChangeScene(GameConstants.GameScene.Words);
            }
            else if (mode == GameConstants.AppMode.CreaturesVTrashDemo)
            {
                // Demo skips training
                ChangeScene(GameConstants.GameScene.Predicting);
            }
            else
            {
                ChangeScene(GameConstants.GameScene.Training);
            }

            OnStateChanged?.Invoke(State);
        }

        /// <summary>
        /// Initialize the appropriate trainer for current mode
        /// </summary>
        private void InitializeTrainer()
        {
            if (State.appMode == GameConstants.AppMode.Short ||
                State.appMode == GameConstants.AppMode.Long)
            {
                State.trainer = new NaiveSVMClassifier();
            }
            else
            {
                State.trainer = new NaiveKNNClassifier();
            }
        }

        /// <summary>
        /// Generate fish/objects for the current mode
        /// </summary>
        private void GenerateFishData()
        {
            State.fishData.Clear();

            int count = State.totalTrainingCount + 20; // Training + prediction items

            bool includeFish = true;
            bool includeCreatures = State.appMode == GameConstants.AppMode.CreaturesVTrash ||
                                   State.appMode == GameConstants.AppMode.CreaturesVTrashDemo;
            bool includeTrash = State.appMode != GameConstants.AppMode.Short &&
                               State.appMode != GameConstants.AppMode.Long;

            var generator = new OceanGenerator();
            State.fishData = generator.GenerateOcean(count, includeFish, includeCreatures, includeTrash);
        }

        /// <summary>
        /// Change to a new scene
        /// </summary>
        public void ChangeScene(GameConstants.GameScene newScene)
        {
            State.currentScene = newScene;
            OnSceneChanged?.Invoke(newScene);
            OnStateChanged?.Invoke(State);
        }

        /// <summary>
        /// Add a training example
        /// </summary>
        public void AddTrainingExample(OceanObjectData data, bool isYes)
        {
            State.trainer.AddExample(data, isYes ? GameConstants.ClassLabel.Yes : GameConstants.ClassLabel.No);
            State.trainingIndex++;

            OnTrainingExampleAdded?.Invoke(data, isYes);
            OnStateChanged?.Invoke(State);

            // Check if training is complete
            if (State.trainingIndex >= State.totalTrainingCount)
            {
                OnTrainingComplete();
            }
        }

        /// <summary>
        /// Called when training is complete
        /// </summary>
        private void OnTrainingComplete()
        {
            // Train the model (for SVM)
            State.trainer.Train();

            // Move to prediction phase
            if (State.appMode == GameConstants.AppMode.Short ||
                State.appMode == GameConstants.AppMode.Long)
            {
                ChangeScene(GameConstants.GameScene.IntermediateLoading);
            }
            else
            {
                ChangeScene(GameConstants.GameScene.Predicting);
            }
        }

        /// <summary>
        /// Make a prediction on an object
        /// </summary>
        public PredictionResult MakePrediction(OceanObjectData data)
        {
            var (prediction, confidence) = State.trainer.Predict(data);
            var result = new PredictionResult(data, prediction, confidence);

            // Determine if correct based on mode
            result.isCorrect = DetermineCorrectness(data, prediction);

            State.pondResults.Add(result);
            OnPredictionMade?.Invoke(result);

            return result;
        }

        /// <summary>
        /// Determine if a prediction is correct
        /// </summary>
        private bool DetermineCorrectness(OceanObjectData data, bool prediction)
        {
            switch (State.appMode)
            {
                case GameConstants.AppMode.FishVTrash:
                    // Yes = Fish, No = Trash
                    bool isFishOrCreature = data.objectType != GameConstants.OceanObjectType.Trash;
                    return prediction == isFishOrCreature;

                case GameConstants.AppMode.CreaturesVTrash:
                case GameConstants.AppMode.CreaturesVTrashDemo:
                    // Yes = Fish/Creature, No = Trash
                    bool isNotTrash = data.objectType != GameConstants.OceanObjectType.Trash;
                    return prediction == isNotTrash;

                case GameConstants.AppMode.Short:
                case GameConstants.AppMode.Long:
                    // Subjective - based on selected word
                    // This would need attribute checking
                    return true; // Simplified for now

                default:
                    return true;
            }
        }

        /// <summary>
        /// Select a word for Short/Long modes
        /// </summary>
        public void SelectWord(string word)
        {
            State.selectedWord = word;
            ChangeScene(GameConstants.GameScene.Training);
            OnStateChanged?.Invoke(State);
        }

        /// <summary>
        /// Move to pond/results scene
        /// </summary>
        public void ShowResults()
        {
            ChangeScene(GameConstants.GameScene.Pond);
        }

        /// <summary>
        /// Select a fish in the pond to view details
        /// </summary>
        public void SelectPondFish(OceanObjectData fish)
        {
            State.selectedPondFish = fish;
            OnStateChanged?.Invoke(State);
        }

        /// <summary>
        /// Toggle guide visibility
        /// </summary>
        public void ToggleGuide(bool show)
        {
            State.guideShowing = show;
            OnStateChanged?.Invoke(State);
        }

        /// <summary>
        /// Advance to next guide
        /// </summary>
        public void NextGuide()
        {
            State.guideIndex++;
            OnStateChanged?.Invoke(State);
        }
    }
}

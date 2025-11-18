using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace AIForOceans
{
    /// <summary>
    /// UI for the training scene - yes/no buttons, counter, etc.
    /// </summary>
    public class TrainingUI : MonoBehaviour
    {
        [Header("Buttons")]
        public GameButton yesButton;
        public GameButton noButton;

        [Header("Display")]
        public TextMeshProUGUI counterText;
        public TextMeshProUGUI instructionText;
        public Image progressBar;

        [Header("Colors")]
        public Color yesButtonColor = new Color(0.2f, 0.8f, 0.2f);
        public Color noButtonColor = new Color(0.8f, 0.2f, 0.2f);

        private void Start()
        {
            // Set up button callbacks
            if (yesButton != null)
            {
                yesButton.OnClicked += OnYesClicked;
                yesButton.SetColors(yesButtonColor, yesButtonColor * 1.1f, yesButtonColor * 0.8f);
            }

            if (noButton != null)
            {
                noButton.OnClicked += OnNoClicked;
                noButton.SetColors(noButtonColor, noButtonColor * 1.1f, noButtonColor * 0.8f);
            }

            // Subscribe to state changes
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged += UpdateUI;
            }
        }

        private void OnDestroy()
        {
            if (yesButton != null)
                yesButton.OnClicked -= OnYesClicked;
            if (noButton != null)
                noButton.OnClicked -= OnNoClicked;

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged -= UpdateUI;
            }
        }

        private void OnYesClicked()
        {
            var state = GameManager.Instance.State;
            if (state.trainingIndex < state.fishData.Count)
            {
                var currentFish = state.fishData[state.trainingIndex];
                GameManager.Instance.AddTrainingExample(currentFish, true);

                if (SoundManager.Instance != null)
                {
                    SoundManager.Instance.PlayYes();
                }
            }
        }

        private void OnNoClicked()
        {
            var state = GameManager.Instance.State;
            if (state.trainingIndex < state.fishData.Count)
            {
                var currentFish = state.fishData[state.trainingIndex];
                GameManager.Instance.AddTrainingExample(currentFish, false);

                if (SoundManager.Instance != null)
                {
                    SoundManager.Instance.PlayNo();
                }
            }
        }

        private void UpdateUI(GameState state)
        {
            // Update counter
            if (counterText != null)
            {
                counterText.text = $"{state.trainingIndex} / {state.totalTrainingCount}";
            }

            // Update progress bar
            if (progressBar != null)
            {
                float progress = state.totalTrainingCount > 0
                    ? (float)state.trainingIndex / state.totalTrainingCount
                    : 0f;
                progressBar.fillAmount = progress;
            }

            // Update instruction text based on mode
            if (instructionText != null)
            {
                instructionText.text = GetInstructionText(state);
            }

            // Disable buttons if training complete
            bool canTrain = state.trainingIndex < state.totalTrainingCount;
            yesButton?.SetInteractable(canTrain);
            noButton?.SetInteractable(canTrain);
        }

        private string GetInstructionText(GameState state)
        {
            return state.appMode switch
            {
                GameConstants.AppMode.FishVTrash =>
                    "Is this a fish?",

                GameConstants.AppMode.CreaturesVTrash =>
                    "Should we keep this in the ocean?",

                GameConstants.AppMode.Short or GameConstants.AppMode.Long =>
                    $"Is this fish {state.selectedWord}?",

                _ => "Train the AI"
            };
        }

        /// <summary>
        /// Show/hide the training UI
        /// </summary>
        public void SetVisible(bool visible)
        {
            gameObject.SetActive(visible);
        }
    }
}

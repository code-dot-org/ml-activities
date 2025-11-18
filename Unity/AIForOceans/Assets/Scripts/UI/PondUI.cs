using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace AIForOceans
{
    /// <summary>
    /// UI for the pond/results scene - displays prediction results
    /// </summary>
    public class PondUI : MonoBehaviour
    {
        [Header("Containers")]
        public Transform yesContainer;
        public Transform noContainer;

        [Header("Labels")]
        public TextMeshProUGUI yesLabel;
        public TextMeshProUGUI noLabel;
        public TextMeshProUGUI summaryText;

        [Header("Detail Panel")]
        public GameObject detailPanel;
        public Image detailFishImage;
        public TextMeshProUGUI detailText;
        public TextMeshProUGUI confidenceText;

        [Header("Prefabs")]
        public GameObject fishThumbnailPrefab;

        private List<GameObject> spawnedThumbnails = new List<GameObject>();

        private void Start()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged += OnStateChanged;
            }

            // Hide detail panel initially
            if (detailPanel != null)
            {
                detailPanel.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged -= OnStateChanged;
            }
        }

        private void OnStateChanged(GameState state)
        {
            if (state.currentScene == GameConstants.GameScene.Pond)
            {
                PopulateResults(state);

                // Show detail panel if fish selected
                if (state.selectedPondFish != null && detailPanel != null)
                {
                    ShowDetailPanel(state.selectedPondFish);
                }
            }
        }

        /// <summary>
        /// Populate the pond with prediction results
        /// </summary>
        private void PopulateResults(GameState state)
        {
            // Clear existing thumbnails
            foreach (var thumbnail in spawnedThumbnails)
            {
                Destroy(thumbnail);
            }
            spawnedThumbnails.Clear();

            // Count results
            int yesCount = 0;
            int noCount = 0;
            int correctCount = 0;

            foreach (var result in state.pondResults)
            {
                // Create thumbnail
                Transform parent = result.prediction ? yesContainer : noContainer;
                if (parent != null && fishThumbnailPrefab != null)
                {
                    GameObject thumbnail = Instantiate(fishThumbnailPrefab, parent);
                    spawnedThumbnails.Add(thumbnail);

                    // Set up thumbnail click
                    var button = thumbnail.GetComponent<Button>();
                    if (button != null)
                    {
                        var fishData = result.objectData;
                        button.onClick.AddListener(() => OnThumbnailClicked(fishData));
                    }

                    // Color based on correctness
                    var image = thumbnail.GetComponent<Image>();
                    if (image != null)
                    {
                        if (result.confidence < 0.3f)
                            image.color = GameConstants.BLUE_FRAME;
                        else if (result.isCorrect)
                            image.color = GameConstants.GREEN_FRAME;
                        else
                            image.color = GameConstants.RED_FRAME;
                    }
                }

                // Count
                if (result.prediction)
                    yesCount++;
                else
                    noCount++;

                if (result.isCorrect)
                    correctCount++;
            }

            // Update labels
            if (yesLabel != null)
                yesLabel.text = $"Yes ({yesCount})";
            if (noLabel != null)
                noLabel.text = $"No ({noCount})";

            // Update summary
            if (summaryText != null)
            {
                float accuracy = state.pondResults.Count > 0
                    ? (float)correctCount / state.pondResults.Count * 100f
                    : 0f;
                summaryText.text = $"Accuracy: {accuracy:F0}%";
            }
        }

        private void OnThumbnailClicked(OceanObjectData fishData)
        {
            GameManager.Instance.SelectPondFish(fishData);
            ShowDetailPanel(fishData);
        }

        /// <summary>
        /// Show detail panel for selected fish
        /// </summary>
        private void ShowDetailPanel(OceanObjectData fishData)
        {
            if (detailPanel == null) return;

            detailPanel.SetActive(true);

            // Find the prediction result for this fish
            var state = GameManager.Instance.State;
            PredictionResult result = null;

            foreach (var r in state.pondResults)
            {
                if (r.objectData.id == fishData.id)
                {
                    result = r;
                    break;
                }
            }

            // Update detail text
            if (detailText != null)
            {
                string details = $"Type: {fishData.objectType}\n";
                if (fishData.objectType == GameConstants.OceanObjectType.Fish)
                {
                    details += $"Body: {fishData.bodyIndex}\n";
                    details += $"Eyes: {fishData.eyesIndex}\n";
                    details += $"Mouth: {fishData.mouthIndex}";
                }
                else
                {
                    details += $"Name: {fishData.subType}";
                }
                detailText.text = details;
            }

            // Update confidence text
            if (confidenceText != null && result != null)
            {
                confidenceText.text = $"Confidence: {result.confidence:P0}\n" +
                                     $"Prediction: {(result.prediction ? "Yes" : "No")}";
            }
        }

        /// <summary>
        /// Hide detail panel
        /// </summary>
        public void HideDetailPanel()
        {
            if (detailPanel != null)
            {
                detailPanel.SetActive(false);
            }
        }

        /// <summary>
        /// Set visibility
        /// </summary>
        public void SetVisible(bool visible)
        {
            gameObject.SetActive(visible);
            if (!visible)
            {
                HideDetailPanel();
            }
        }
    }
}

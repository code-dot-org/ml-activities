using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace AIForOceans
{
    /// <summary>
    /// UI for word selection in Short/Long modes
    /// </summary>
    public class WordSelectionUI : MonoBehaviour
    {
        [Header("Layout")]
        public Transform wordButtonContainer;
        public GameObject wordButtonPrefab;

        [Header("Display")]
        public TextMeshProUGUI titleText;
        public TextMeshProUGUI instructionText;

        private void OnEnable()
        {
            PopulateWords();
        }

        /// <summary>
        /// Populate word buttons based on current mode
        /// </summary>
        private void PopulateWords()
        {
            if (wordButtonContainer == null || wordButtonPrefab == null)
                return;

            // Clear existing buttons
            foreach (Transform child in wordButtonContainer)
            {
                Destroy(child.gameObject);
            }

            // Get words for current mode
            var state = GameManager.Instance.State;
            string[] words = state.appMode == GameConstants.AppMode.Short
                ? GameConstants.SHORT_WORDS
                : GameConstants.LONG_WORDS;

            // Update title
            if (titleText != null)
            {
                titleText.text = state.appMode == GameConstants.AppMode.Short
                    ? "Choose a word to teach the AI"
                    : "Choose any word to teach the AI";
            }

            if (instructionText != null)
            {
                instructionText.text = "The AI will learn to recognize fish with this trait";
            }

            // Create buttons
            foreach (string word in words)
            {
                CreateWordButton(word);
            }
        }

        /// <summary>
        /// Create a single word button
        /// </summary>
        private void CreateWordButton(string word)
        {
            GameObject buttonObj = Instantiate(wordButtonPrefab, wordButtonContainer);

            // Set button text
            var textComponent = buttonObj.GetComponentInChildren<TextMeshProUGUI>();
            if (textComponent != null)
            {
                textComponent.text = word;
            }

            // Set up click handler
            var button = buttonObj.GetComponent<Button>();
            if (button != null)
            {
                button.onClick.AddListener(() => OnWordSelected(word));
            }

            // Optional: Style based on word type
            var image = buttonObj.GetComponent<Image>();
            if (image != null)
            {
                image.color = GetWordColor(word);
            }
        }

        /// <summary>
        /// Get color for word button based on word type
        /// </summary>
        private Color GetWordColor(string word)
        {
            return word.ToLower() switch
            {
                "blue" => new Color(0.3f, 0.5f, 1f),
                "orange" => new Color(1f, 0.6f, 0.2f),
                "green" => new Color(0.3f, 0.8f, 0.3f),
                "purple" => new Color(0.7f, 0.3f, 0.9f),
                "yellow" => new Color(1f, 0.9f, 0.3f),
                "red" => new Color(1f, 0.4f, 0.4f),
                _ => new Color(0.9f, 0.9f, 0.9f) // Default gray
            };
        }

        /// <summary>
        /// Called when a word is selected
        /// </summary>
        private void OnWordSelected(string word)
        {
            if (SoundManager.Instance != null)
            {
                SoundManager.Instance.PlayButtonClick();
            }

            GameManager.Instance.SelectWord(word);
        }

        /// <summary>
        /// Set visibility
        /// </summary>
        public void SetVisible(bool visible)
        {
            gameObject.SetActive(visible);
        }
    }
}

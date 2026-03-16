using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace AIForOceans
{
    /// <summary>
    /// Tutorial/guide system with typing text effect
    /// </summary>
    public class GuideUI : MonoBehaviour
    {
        [Header("UI Elements")]
        public GameObject guidePanel;
        public TextMeshProUGUI guideText;
        public Button dismissButton;
        public Button nextButton;

        [Header("Typing Effect")]
        public float typingSpeed = 0.03f;
        public bool useTypingEffect = true;

        [Header("Guide Content")]
        [TextArea(3, 5)]
        public string[] guideMessages;

        private int currentGuideIndex = 0;
        private bool isTyping = false;
        private Coroutine typingCoroutine;

        private void Start()
        {
            // Set up button callbacks
            if (dismissButton != null)
            {
                dismissButton.onClick.AddListener(DismissGuide);
            }

            if (nextButton != null)
            {
                nextButton.onClick.AddListener(NextGuide);
            }

            // Subscribe to state changes
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged += OnStateChanged;
                GameManager.Instance.OnSceneChanged += OnSceneChanged;
            }

            // Hide initially
            if (guidePanel != null)
            {
                guidePanel.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged -= OnStateChanged;
                GameManager.Instance.OnSceneChanged -= OnSceneChanged;
            }
        }

        private void OnStateChanged(GameState state)
        {
            if (guidePanel != null)
            {
                guidePanel.SetActive(state.guideShowing);
            }
        }

        private void OnSceneChanged(GameConstants.GameScene scene)
        {
            // Show appropriate guide for scene
            string message = GetGuideForScene(scene);
            if (!string.IsNullOrEmpty(message))
            {
                ShowGuide(message);
            }
        }

        /// <summary>
        /// Get guide message for a scene
        /// </summary>
        private string GetGuideForScene(GameConstants.GameScene scene)
        {
            var state = GameManager.Instance.State;

            return scene switch
            {
                GameConstants.GameScene.Training => state.appMode switch
                {
                    GameConstants.AppMode.FishVTrash =>
                        "Help the AI learn! Click YES if it's a fish, NO if it's trash.",
                    GameConstants.AppMode.CreaturesVTrash =>
                        "Train the AI to keep ocean creatures and remove trash.",
                    GameConstants.AppMode.Short or GameConstants.AppMode.Long =>
                        $"Is this fish {state.selectedWord}? You decide!",
                    _ => ""
                },

                GameConstants.GameScene.Predicting =>
                    "Watch the AI make predictions based on what you taught it!",

                GameConstants.GameScene.Pond =>
                    "See how the AI did! Green means correct, red means wrong.",

                GameConstants.GameScene.Words =>
                    "Pick a word. You'll teach the AI what this word means for fish.",

                _ => ""
            };
        }

        /// <summary>
        /// Show a guide message
        /// </summary>
        public void ShowGuide(string message)
        {
            if (guidePanel == null || guideText == null)
                return;

            guidePanel.SetActive(true);
            GameManager.Instance.ToggleGuide(true);

            if (useTypingEffect)
            {
                if (typingCoroutine != null)
                {
                    StopCoroutine(typingCoroutine);
                }
                typingCoroutine = StartCoroutine(TypeText(message));
            }
            else
            {
                guideText.text = message;
            }
        }

        /// <summary>
        /// Type text character by character
        /// </summary>
        private IEnumerator TypeText(string message)
        {
            isTyping = true;
            guideText.text = "";

            foreach (char c in message)
            {
                guideText.text += c;
                yield return new WaitForSeconds(typingSpeed);
            }

            isTyping = false;
        }

        /// <summary>
        /// Skip to end of typing
        /// </summary>
        public void SkipTyping()
        {
            if (isTyping && typingCoroutine != null)
            {
                StopCoroutine(typingCoroutine);
                // Show full message
                string scene = GameManager.Instance.State.currentScene.ToString();
                guideText.text = GetGuideForScene(GameManager.Instance.State.currentScene);
                isTyping = false;
            }
        }

        /// <summary>
        /// Dismiss the guide
        /// </summary>
        public void DismissGuide()
        {
            if (isTyping)
            {
                SkipTyping();
            }
            else
            {
                if (guidePanel != null)
                {
                    guidePanel.SetActive(false);
                }
                GameManager.Instance.ToggleGuide(false);
            }
        }

        /// <summary>
        /// Show next guide message
        /// </summary>
        public void NextGuide()
        {
            if (isTyping)
            {
                SkipTyping();
                return;
            }

            currentGuideIndex++;
            if (guideMessages != null && currentGuideIndex < guideMessages.Length)
            {
                ShowGuide(guideMessages[currentGuideIndex]);
            }
            else
            {
                DismissGuide();
            }

            GameManager.Instance.NextGuide();
        }

        /// <summary>
        /// Set visibility
        /// </summary>
        public void SetVisible(bool visible)
        {
            if (guidePanel != null)
            {
                guidePanel.SetActive(visible);
            }
        }
    }
}

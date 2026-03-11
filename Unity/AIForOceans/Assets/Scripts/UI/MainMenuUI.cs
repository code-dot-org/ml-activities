using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace AIForOceans
{
    /// <summary>
    /// Main menu for selecting game modes
    /// </summary>
    public class MainMenuUI : MonoBehaviour
    {
        [Header("Mode Buttons")]
        public Button fishVTrashButton;
        public Button creaturesVTrashDemoButton;
        public Button creaturesVTrashButton;
        public Button shortModeButton;
        public Button longModeButton;

        [Header("Display")]
        public TextMeshProUGUI titleText;
        public TextMeshProUGUI descriptionText;

        [Header("Mode Descriptions")]
        [TextArea(2, 4)]
        public string fishVTrashDesc = "Train the AI to tell fish from trash!";
        [TextArea(2, 4)]
        public string creaturesVTrashDemoDesc = "See what happens when AI meets new things.";
        [TextArea(2, 4)]
        public string creaturesVTrashDesc = "Keep sea creatures, remove trash!";
        [TextArea(2, 4)]
        public string shortModeDesc = "Pick a word and teach the AI what it means.";
        [TextArea(2, 4)]
        public string longModeDesc = "Advanced: More words, more training!";

        private void Start()
        {
            SetupButton(fishVTrashButton, GameConstants.AppMode.FishVTrash, fishVTrashDesc);
            SetupButton(creaturesVTrashDemoButton, GameConstants.AppMode.CreaturesVTrashDemo, creaturesVTrashDemoDesc);
            SetupButton(creaturesVTrashButton, GameConstants.AppMode.CreaturesVTrash, creaturesVTrashDesc);
            SetupButton(shortModeButton, GameConstants.AppMode.Short, shortModeDesc);
            SetupButton(longModeButton, GameConstants.AppMode.Long, longModeDesc);

            // Set initial description
            if (descriptionText != null)
            {
                descriptionText.text = "Choose an activity to start!";
            }
        }

        private void SetupButton(Button button, GameConstants.AppMode mode, string description)
        {
            if (button == null) return;

            // Click to start game
            button.onClick.AddListener(() => StartMode(mode));

            // Hover to show description
            var eventTrigger = button.gameObject.AddComponent<UnityEngine.EventSystems.EventTrigger>();

            var pointerEnter = new UnityEngine.EventSystems.EventTrigger.Entry
            {
                eventID = UnityEngine.EventSystems.EventTriggerType.PointerEnter
            };
            pointerEnter.callback.AddListener((data) => ShowDescription(description));
            eventTrigger.triggers.Add(pointerEnter);

            var pointerExit = new UnityEngine.EventSystems.EventTrigger.Entry
            {
                eventID = UnityEngine.EventSystems.EventTriggerType.PointerExit
            };
            pointerExit.callback.AddListener((data) => HideDescription());
            eventTrigger.triggers.Add(pointerExit);
        }

        private void StartMode(GameConstants.AppMode mode)
        {
            if (SoundManager.Instance != null)
            {
                SoundManager.Instance.PlayButtonClick();
            }

            // Hide menu
            gameObject.SetActive(false);

            // Start game
            GameManager.Instance.StartGame(mode);
        }

        private void ShowDescription(string description)
        {
            if (descriptionText != null)
            {
                descriptionText.text = description;
            }
        }

        private void HideDescription()
        {
            if (descriptionText != null)
            {
                descriptionText.text = "";
            }
        }

        /// <summary>
        /// Show the main menu
        /// </summary>
        public void Show()
        {
            gameObject.SetActive(true);
        }

        /// <summary>
        /// Hide the main menu
        /// </summary>
        public void Hide()
        {
            gameObject.SetActive(false);
        }
    }
}

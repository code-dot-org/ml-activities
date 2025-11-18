using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace AIForOceans
{
    /// <summary>
    /// Reusable confirmation dialog
    /// </summary>
    public class ConfirmationDialog : MonoBehaviour
    {
        [Header("UI Elements")]
        public GameObject dialogPanel;
        public TextMeshProUGUI titleText;
        public TextMeshProUGUI messageText;
        public Button confirmButton;
        public Button cancelButton;
        public TextMeshProUGUI confirmButtonText;
        public TextMeshProUGUI cancelButtonText;

        // Callbacks
        private Action onConfirm;
        private Action onCancel;

        private void Start()
        {
            // Set up button listeners
            if (confirmButton != null)
            {
                confirmButton.onClick.AddListener(OnConfirmClicked);
            }

            if (cancelButton != null)
            {
                cancelButton.onClick.AddListener(OnCancelClicked);
            }

            // Hide by default
            Hide();
        }

        /// <summary>
        /// Show the dialog with custom content
        /// </summary>
        public void Show(
            string title,
            string message,
            string confirmText = "OK",
            string cancelText = "Cancel",
            Action onConfirmCallback = null,
            Action onCancelCallback = null)
        {
            if (dialogPanel != null)
            {
                dialogPanel.SetActive(true);
            }

            if (titleText != null)
            {
                titleText.text = title;
            }

            if (messageText != null)
            {
                messageText.text = message;
            }

            if (confirmButtonText != null)
            {
                confirmButtonText.text = confirmText;
            }

            if (cancelButtonText != null)
            {
                cancelButtonText.text = cancelText;
            }

            onConfirm = onConfirmCallback;
            onCancel = onCancelCallback;

            // Show/hide cancel button based on callback
            if (cancelButton != null)
            {
                cancelButton.gameObject.SetActive(onCancel != null || !string.IsNullOrEmpty(cancelText));
            }
        }

        /// <summary>
        /// Show a simple alert (OK only)
        /// </summary>
        public void ShowAlert(string title, string message, Action onOk = null)
        {
            Show(title, message, "OK", "", onOk, null);
        }

        /// <summary>
        /// Hide the dialog
        /// </summary>
        public void Hide()
        {
            if (dialogPanel != null)
            {
                dialogPanel.SetActive(false);
            }

            onConfirm = null;
            onCancel = null;
        }

        private void OnConfirmClicked()
        {
            if (SoundManager.Instance != null)
            {
                SoundManager.Instance.PlayButtonClick();
            }

            onConfirm?.Invoke();
            Hide();
        }

        private void OnCancelClicked()
        {
            if (SoundManager.Instance != null)
            {
                SoundManager.Instance.PlayButtonClick();
            }

            onCancel?.Invoke();
            Hide();
        }
    }
}

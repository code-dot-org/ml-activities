using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace AIForOceans
{
    /// <summary>
    /// UI for the prediction scene - shows AI analyzing and results
    /// </summary>
    public class PredictionUI : MonoBehaviour
    {
        [Header("Display")]
        public TextMeshProUGUI statusText;
        public Image predictionFrame;

        [Header("Frame Colors")]
        public Color greenFrame = new Color(0.2f, 0.8f, 0.2f);
        public Color redFrame = new Color(0.8f, 0.2f, 0.2f);
        public Color blueFrame = new Color(0.2f, 0.4f, 0.8f);

        [Header("Animation")]
        public float framePulseSpeed = 2f;
        public float framePulseAmount = 0.1f;

        private bool isPulsing = false;
        private Color currentFrameColor;

        private void Start()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPredictionMade += OnPredictionMade;
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPredictionMade -= OnPredictionMade;
            }
        }

        private void Update()
        {
            if (isPulsing && predictionFrame != null)
            {
                // Pulse the frame opacity
                float pulse = 1f + Mathf.Sin(Time.time * framePulseSpeed) * framePulseAmount;
                Color c = currentFrameColor;
                c.a = Mathf.Clamp01(pulse);
                predictionFrame.color = c;
            }
        }

        private void OnPredictionMade(PredictionResult result)
        {
            // Update status text
            if (statusText != null)
            {
                string confidence = result.confidence > 0.7f ? "confident" :
                                   result.confidence > 0.3f ? "unsure" : "guessing";

                statusText.text = $"AI is {confidence}: {(result.prediction ? "Yes" : "No")}";
            }

            // Set frame color based on result
            SetFrameColor(result);

            // Play appropriate sound
            if (SoundManager.Instance != null)
            {
                if (result.prediction)
                    SoundManager.Instance.PlaySortYes();
                else
                    SoundManager.Instance.PlaySortNo();
            }
        }

        private void SetFrameColor(PredictionResult result)
        {
            if (predictionFrame == null) return;

            if (result.confidence < GameConstants.LOW_CONFIDENCE_THRESHOLD)
            {
                // Low confidence - blue/uncertain
                currentFrameColor = blueFrame;
            }
            else if (result.prediction)
            {
                // Yes prediction - green
                currentFrameColor = greenFrame;
            }
            else
            {
                // No prediction - red
                currentFrameColor = redFrame;
            }

            predictionFrame.color = currentFrameColor;
            isPulsing = true;
        }

        /// <summary>
        /// Show scanning state
        /// </summary>
        public void ShowScanning()
        {
            if (statusText != null)
            {
                statusText.text = "AI is analyzing...";
            }

            if (predictionFrame != null)
            {
                currentFrameColor = blueFrame;
                predictionFrame.color = currentFrameColor;
                isPulsing = true;
            }
        }

        /// <summary>
        /// Hide prediction display
        /// </summary>
        public void Hide()
        {
            isPulsing = false;
            if (predictionFrame != null)
            {
                predictionFrame.color = Color.clear;
            }
            if (statusText != null)
            {
                statusText.text = "";
            }
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

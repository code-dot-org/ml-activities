using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Handles responsive UI scaling based on screen size
    /// </summary>
    public class ScreenScaler : MonoBehaviour
    {
        [Header("Reference Resolution")]
        public Vector2 referenceResolution = new Vector2(400f, 400f);

        [Header("Scaling")]
        public bool scaleUI = true;
        public bool maintainAspectRatio = true;

        private Canvas canvas;

        private void Start()
        {
            canvas = GetComponent<Canvas>();
            UpdateScale();
        }

        private void Update()
        {
            // Update scale if screen size changes
            UpdateScale();
        }

        private void UpdateScale()
        {
            if (canvas == null) return;

            float screenWidth = Screen.width;
            float screenHeight = Screen.height;

            float scaleX = screenWidth / referenceResolution.x;
            float scaleY = screenHeight / referenceResolution.y;

            float scale = maintainAspectRatio ? Mathf.Min(scaleX, scaleY) : 1f;

            if (scaleUI)
            {
                canvas.scaleFactor = scale;
            }
        }

        /// <summary>
        /// Get scale factor for manual scaling
        /// </summary>
        public float GetScaleFactor()
        {
            float screenWidth = Screen.width;
            float screenHeight = Screen.height;

            float scaleX = screenWidth / referenceResolution.x;
            float scaleY = screenHeight / referenceResolution.y;

            return maintainAspectRatio ? Mathf.Min(scaleX, scaleY) : 1f;
        }
    }
}

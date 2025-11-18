using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Manages background rendering for the ocean scene
    /// </summary>
    public class BackgroundManager : MonoBehaviour
    {
        [Header("Background Sprites")]
        public SpriteRenderer backgroundRenderer;
        public SpriteRenderer[] layerRenderers;

        [Header("Parallax Settings")]
        public bool enableParallax = false;
        public float[] parallaxFactors;

        [Header("Colors")]
        public Color oceanColorTop = new Color(0.1f, 0.3f, 0.6f);
        public Color oceanColorBottom = new Color(0.05f, 0.1f, 0.3f);

        private Camera mainCamera;
        private Vector3 lastCameraPosition;

        private void Start()
        {
            mainCamera = Camera.main;
            if (mainCamera != null)
            {
                lastCameraPosition = mainCamera.transform.position;
                mainCamera.backgroundColor = oceanColorTop;
            }
        }

        private void LateUpdate()
        {
            if (enableParallax && mainCamera != null)
            {
                UpdateParallax();
            }
        }

        private void UpdateParallax()
        {
            Vector3 deltaMovement = mainCamera.transform.position - lastCameraPosition;

            for (int i = 0; i < layerRenderers.Length; i++)
            {
                if (layerRenderers[i] == null) continue;

                float factor = i < parallaxFactors.Length ? parallaxFactors[i] : 0.5f;
                Vector3 offset = new Vector3(deltaMovement.x * factor, deltaMovement.y * factor, 0);
                layerRenderers[i].transform.position += offset;
            }

            lastCameraPosition = mainCamera.transform.position;
        }

        /// <summary>
        /// Set background color
        /// </summary>
        public void SetBackgroundColor(Color color)
        {
            if (mainCamera != null)
            {
                mainCamera.backgroundColor = color;
            }
        }

        /// <summary>
        /// Set background sprite
        /// </summary>
        public void SetBackgroundSprite(Sprite sprite)
        {
            if (backgroundRenderer != null)
            {
                backgroundRenderer.sprite = sprite;
            }
        }
    }
}

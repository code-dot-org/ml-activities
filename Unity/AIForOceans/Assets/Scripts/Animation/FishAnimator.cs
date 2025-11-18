using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Handles fish animation - bobbing, movement, scanning pause
    /// Mirrors the original renderer.js animation logic
    /// </summary>
    public class FishAnimator : MonoBehaviour
    {
        [Header("Animation Settings")]
        public float bobAmplitude = 10f;
        public float bobFrequency = 2f;
        public float moveSpeed = 100f;

        [Header("Scan Settings")]
        public bool isPaused = false;
        public float scanPauseDuration = 1.5f;

        // Internal state
        private float startTime;
        private float pauseStartTime;
        private float totalPauseTime;
        private Vector2 startPosition;
        private float bobPhase;

        // S-curve animation for scanning
        private bool isScanning = false;
        private float scanStartTime;
        private float scanProgress;

        private void Start()
        {
            startTime = Time.time;
            startPosition = transform.position;
        }

        /// <summary>
        /// Initialize with ocean object data
        /// </summary>
        public void Initialize(OceanObjectData data)
        {
            bobPhase = data.bobPhase;
            moveSpeed = data.speed;
            startPosition = data.position;
            transform.position = startPosition;
        }

        private void Update()
        {
            if (!isPaused)
            {
                UpdateMovement();
            }

            UpdateBobbing();

            if (isScanning)
            {
                UpdateScanAnimation();
            }
        }

        /// <summary>
        /// Update horizontal movement
        /// </summary>
        private void UpdateMovement()
        {
            float elapsed = Time.time - startTime - totalPauseTime;
            float xOffset = elapsed * moveSpeed;

            Vector2 pos = transform.position;
            pos.x = startPosition.x + xOffset;
            transform.position = pos;
        }

        /// <summary>
        /// Update bobbing animation (sine wave)
        /// </summary>
        private void UpdateBobbing()
        {
            float time = Time.time;
            float bobOffset = Mathf.Sin(time * bobFrequency + bobPhase) * bobAmplitude;

            Vector2 pos = transform.position;
            pos.y = startPosition.y + bobOffset;
            transform.position = pos;
        }

        /// <summary>
        /// Start pause for scanning
        /// </summary>
        public void StartScan()
        {
            isPaused = true;
            pauseStartTime = Time.time;
            isScanning = true;
            scanStartTime = Time.time;
            scanProgress = 0f;
        }

        /// <summary>
        /// End scanning and resume movement
        /// </summary>
        public void EndScan()
        {
            isPaused = false;
            totalPauseTime += Time.time - pauseStartTime;
            isScanning = false;
        }

        /// <summary>
        /// Update scanning S-curve animation
        /// </summary>
        private void UpdateScanAnimation()
        {
            float elapsed = Time.time - scanStartTime;
            scanProgress = Mathf.Clamp01(elapsed / scanPauseDuration);

            // S-curve easing: slow at start and end, fast in middle
            float easedProgress = SCurve(scanProgress);

            // Can be used to animate scan overlay or other effects
            // The original uses this to pause fish in center while AI analyzes
        }

        /// <summary>
        /// S-curve (sigmoid-like) easing function
        /// </summary>
        public static float SCurve(float t)
        {
            // Hermite interpolation (smooth step)
            return t * t * (3f - 2f * t);
        }

        /// <summary>
        /// More pronounced S-curve
        /// </summary>
        public static float SCurveSteep(float t)
        {
            // Quintic smooth step
            return t * t * t * (t * (t * 6f - 15f) + 10f);
        }

        /// <summary>
        /// Check if fish has moved off screen
        /// </summary>
        public bool IsOffScreen(float screenWidth)
        {
            return transform.position.x > screenWidth + 100f;
        }

        /// <summary>
        /// Reset to start position
        /// </summary>
        public void Reset()
        {
            startTime = Time.time;
            totalPauseTime = 0f;
            transform.position = startPosition;
            isPaused = false;
            isScanning = false;
        }
    }
}

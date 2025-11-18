using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace AIForOceans
{
    /// <summary>
    /// AI Bot character with different expression states
    /// </summary>
    public class AIBot : MonoBehaviour
    {
        public enum Expression
        {
            Neutral,
            Thinking,
            Yes,
            No,
            Scanning,
            Closed
        }

        [Header("Sprite References")]
        public Image bodyImage;
        public Image headImage;
        public Image expressionImage;
        public Image scanOverlayImage;

        [Header("Expression Sprites")]
        public Sprite neutralSprite;
        public Sprite thinkingSprite;
        public Sprite yesSprite;
        public Sprite noSprite;
        public Sprite scanningSprite;
        public Sprite closedSprite;

        [Header("Animation")]
        public float expressionDuration = 1f;
        public float bobAmplitude = 5f;
        public float bobFrequency = 1f;

        private Expression currentExpression = Expression.Neutral;
        private Coroutine expressionCoroutine;
        private Vector3 basePosition;

        private void Start()
        {
            basePosition = transform.position;
            SetExpression(Expression.Neutral);

            // Hide scan overlay initially
            if (scanOverlayImage != null)
            {
                scanOverlayImage.enabled = false;
            }
        }

        private void Update()
        {
            // Gentle bobbing animation
            float bobOffset = Mathf.Sin(Time.time * bobFrequency) * bobAmplitude;
            transform.position = basePosition + new Vector3(0f, bobOffset, 0f);
        }

        /// <summary>
        /// Set the bot's expression
        /// </summary>
        public void SetExpression(Expression expression)
        {
            currentExpression = expression;

            // Update expression sprite
            if (expressionImage != null)
            {
                expressionImage.sprite = expression switch
                {
                    Expression.Neutral => neutralSprite,
                    Expression.Thinking => thinkingSprite,
                    Expression.Yes => yesSprite,
                    Expression.No => noSprite,
                    Expression.Scanning => scanningSprite,
                    Expression.Closed => closedSprite,
                    _ => neutralSprite
                };
            }

            // Show/hide scan overlay
            if (scanOverlayImage != null)
            {
                scanOverlayImage.enabled = expression == Expression.Scanning;
            }

            // Auto-return to neutral for reactions
            if (expression == Expression.Yes || expression == Expression.No)
            {
                if (expressionCoroutine != null)
                {
                    StopCoroutine(expressionCoroutine);
                }
                expressionCoroutine = StartCoroutine(ReturnToNeutral());
            }
        }

        /// <summary>
        /// Return to neutral after showing expression
        /// </summary>
        private IEnumerator ReturnToNeutral()
        {
            yield return new WaitForSeconds(expressionDuration);

            if (currentExpression == Expression.Yes || currentExpression == Expression.No)
            {
                SetExpression(Expression.Neutral);
            }
        }

        /// <summary>
        /// Play a celebration animation
        /// </summary>
        public void Celebrate()
        {
            StartCoroutine(CelebrationAnimation());
        }

        private IEnumerator CelebrationAnimation()
        {
            SetExpression(Expression.Yes);

            // Bounce animation
            float duration = 0.5f;
            float elapsed = 0f;
            Vector3 startPos = basePosition;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                float bounce = Mathf.Sin(t * Mathf.PI * 3) * 10f * (1f - t);
                transform.position = startPos + new Vector3(0f, bounce, 0f);
                yield return null;
            }

            transform.position = startPos;
        }

        /// <summary>
        /// Get current expression
        /// </summary>
        public Expression GetExpression()
        {
            return currentExpression;
        }
    }
}

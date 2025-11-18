using System.Collections;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Controls the training scene flow
    /// </summary>
    public class TrainingSceneController : MonoBehaviour
    {
        [Header("References")]
        public FishRenderer currentFishRenderer;
        public FishAnimator currentFishAnimator;
        public AIBot aiBot;
        public TrainingUI trainingUI;

        [Header("Spawn Settings")]
        public Vector2 spawnPosition = new Vector2(-200f, 0f);
        public Vector2 centerPosition = new Vector2(0f, 0f);
        public float fishEnterDuration = 1f;

        private OceanObjectData currentFish;
        private bool isAnimating = false;

        private void OnEnable()
        {
            // Subscribe to events
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnTrainingExampleAdded += OnExampleAdded;
            }

            // Show first fish
            ShowNextFish();
        }

        private void OnDisable()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnTrainingExampleAdded -= OnExampleAdded;
            }
        }

        /// <summary>
        /// Show the next fish in the training sequence
        /// </summary>
        private void ShowNextFish()
        {
            var state = GameManager.Instance.State;

            if (state.trainingIndex >= state.fishData.Count)
            {
                Debug.LogWarning("No more fish to show");
                return;
            }

            currentFish = state.fishData[state.trainingIndex];

            // Set up the fish renderer
            if (currentFishRenderer != null)
            {
                if (currentFish.objectType == GameConstants.OceanObjectType.Fish)
                {
                    currentFishRenderer.SetupFish(currentFish);
                }
                // For creatures/trash, would need different rendering
            }

            // Animate fish entering
            StartCoroutine(AnimateFishEnter());
        }

        /// <summary>
        /// Animate fish swimming in from left
        /// </summary>
        private IEnumerator AnimateFishEnter()
        {
            isAnimating = true;

            if (currentFishRenderer == null)
            {
                isAnimating = false;
                yield break;
            }

            Transform fishTransform = currentFishRenderer.transform;
            fishTransform.position = spawnPosition;

            float elapsed = 0f;

            while (elapsed < fishEnterDuration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / fishEnterDuration;

                // Ease in-out
                float easedT = FishAnimator.SCurve(t);

                fishTransform.position = Vector2.Lerp(spawnPosition, centerPosition, easedT);
                yield return null;
            }

            fishTransform.position = centerPosition;
            isAnimating = false;

            // AI bot looks at fish
            if (aiBot != null)
            {
                aiBot.SetExpression(AIBot.Expression.Thinking);
            }
        }

        /// <summary>
        /// Called when user labels current fish
        /// </summary>
        private void OnExampleAdded(OceanObjectData data, bool isYes)
        {
            // AI bot reacts
            if (aiBot != null)
            {
                aiBot.SetExpression(isYes ? AIBot.Expression.Yes : AIBot.Expression.No);
            }

            // Animate fish exit and show next
            StartCoroutine(AnimateFishExitAndShowNext(isYes));
        }

        /// <summary>
        /// Animate fish exiting and bring in next
        /// </summary>
        private IEnumerator AnimateFishExitAndShowNext(bool wasYes)
        {
            if (currentFishRenderer == null)
                yield break;

            isAnimating = true;

            Transform fishTransform = currentFishRenderer.transform;
            Vector2 exitPosition = new Vector2(200f, 0f);

            float elapsed = 0f;
            float exitDuration = 0.5f;

            while (elapsed < exitDuration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / exitDuration;
                float easedT = FishAnimator.SCurve(t);

                fishTransform.position = Vector2.Lerp(centerPosition, exitPosition, easedT);
                yield return null;
            }

            // Brief pause
            yield return new WaitForSeconds(0.2f);

            // Check if more fish to show
            var state = GameManager.Instance.State;
            if (state.trainingIndex < state.totalTrainingCount &&
                state.trainingIndex < state.fishData.Count)
            {
                ShowNextFish();
            }

            isAnimating = false;
        }

        /// <summary>
        /// Skip current animation (for fast users)
        /// </summary>
        public void SkipAnimation()
        {
            if (isAnimating)
            {
                StopAllCoroutines();
                isAnimating = false;

                if (currentFishRenderer != null)
                {
                    currentFishRenderer.transform.position = centerPosition;
                }
            }
        }
    }
}

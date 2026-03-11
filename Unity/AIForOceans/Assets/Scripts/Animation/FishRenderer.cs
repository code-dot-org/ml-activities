using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Renders a procedurally generated fish from sprite components
    /// </summary>
    public class FishRenderer : MonoBehaviour
    {
        [Header("Sprite Renderers")]
        public SpriteRenderer bodyRenderer;
        public SpriteRenderer eyesRenderer;
        public SpriteRenderer mouthRenderer;
        public SpriteRenderer dorsalFinRenderer;
        public SpriteRenderer pectoralFinFrontRenderer;
        public SpriteRenderer pectoralFinBackRenderer;
        public SpriteRenderer tailFinRenderer;
        public SpriteRenderer scalesRenderer;

        [Header("Sprite Arrays (set in inspector or load from Resources)")]
        public Sprite[] bodySprites;
        public Sprite[] eyesSprites;
        public Sprite[] mouthSprites;
        public Sprite[] dorsalFinSprites;
        public Sprite[] pectoralFinSprites;
        public Sprite[] tailFinSprites;
        public Sprite[] scalesSprites;

        // Current fish data
        private OceanObjectData currentData;

        /// <summary>
        /// Set up the fish visual from data
        /// </summary>
        public void SetupFish(OceanObjectData data)
        {
            currentData = data;

            if (data.objectType != GameConstants.OceanObjectType.Fish)
            {
                Debug.LogWarning("FishRenderer.SetupFish called with non-fish object");
                return;
            }

            // Set sprites
            SetSpriteIfValid(bodyRenderer, bodySprites, data.bodyIndex);
            SetSpriteIfValid(eyesRenderer, eyesSprites, data.eyesIndex);
            SetSpriteIfValid(mouthRenderer, mouthSprites, data.mouthIndex);
            SetSpriteIfValid(dorsalFinRenderer, dorsalFinSprites, data.dorsalFinIndex);
            SetSpriteIfValid(pectoralFinFrontRenderer, pectoralFinSprites, data.pectoralFinIndex);
            SetSpriteIfValid(pectoralFinBackRenderer, pectoralFinSprites, data.pectoralFinIndex);
            SetSpriteIfValid(tailFinRenderer, tailFinSprites, data.tailFinIndex);
            SetSpriteIfValid(scalesRenderer, scalesSprites, data.scalesIndex);

            // Apply colors
            ApplyColors(data);
        }

        /// <summary>
        /// Set sprite if index is valid
        /// </summary>
        private void SetSpriteIfValid(SpriteRenderer renderer, Sprite[] sprites, int index)
        {
            if (renderer == null || sprites == null || sprites.Length == 0)
                return;

            int safeIndex = Mathf.Clamp(index, 0, sprites.Length - 1);
            renderer.sprite = sprites[safeIndex];
        }

        /// <summary>
        /// Apply color tinting to fish parts
        /// </summary>
        private void ApplyColors(OceanObjectData data)
        {
            // Body uses primary color
            if (bodyRenderer != null)
                bodyRenderer.color = data.primaryColor;

            // Scales use secondary color
            if (scalesRenderer != null)
                scalesRenderer.color = data.secondaryColor;

            // Fins use fin color
            Color finColor = data.finColor;
            if (dorsalFinRenderer != null)
                dorsalFinRenderer.color = finColor;
            if (pectoralFinFrontRenderer != null)
                pectoralFinFrontRenderer.color = finColor;
            if (pectoralFinBackRenderer != null)
                pectoralFinBackRenderer.color = finColor;
            if (tailFinRenderer != null)
                tailFinRenderer.color = finColor;

            // Eyes and mouth stay neutral (white/original)
            if (eyesRenderer != null)
                eyesRenderer.color = Color.white;
            if (mouthRenderer != null)
                mouthRenderer.color = Color.white;
        }

        /// <summary>
        /// Set sorting order for all parts
        /// </summary>
        public void SetSortingOrder(int baseOrder)
        {
            // Back to front ordering
            if (tailFinRenderer != null)
                tailFinRenderer.sortingOrder = baseOrder;
            if (pectoralFinBackRenderer != null)
                pectoralFinBackRenderer.sortingOrder = baseOrder + 1;
            if (dorsalFinRenderer != null)
                dorsalFinRenderer.sortingOrder = baseOrder + 2;
            if (bodyRenderer != null)
                bodyRenderer.sortingOrder = baseOrder + 3;
            if (scalesRenderer != null)
                scalesRenderer.sortingOrder = baseOrder + 4;
            if (pectoralFinFrontRenderer != null)
                pectoralFinFrontRenderer.sortingOrder = baseOrder + 5;
            if (eyesRenderer != null)
                eyesRenderer.sortingOrder = baseOrder + 6;
            if (mouthRenderer != null)
                mouthRenderer.sortingOrder = baseOrder + 7;
        }

        /// <summary>
        /// Flip the fish horizontally
        /// </summary>
        public void SetFlipped(bool flipped)
        {
            Vector3 scale = transform.localScale;
            scale.x = flipped ? -Mathf.Abs(scale.x) : Mathf.Abs(scale.x);
            transform.localScale = scale;
        }

        /// <summary>
        /// Show/hide the fish
        /// </summary>
        public void SetVisible(bool visible)
        {
            gameObject.SetActive(visible);
        }

        /// <summary>
        /// Apply a highlight effect (for selection)
        /// </summary>
        public void SetHighlighted(bool highlighted)
        {
            float brightness = highlighted ? 1.2f : 1f;

            // Brighten all parts slightly
            if (bodyRenderer != null)
            {
                Color c = currentData.primaryColor * brightness;
                c.a = 1f;
                bodyRenderer.color = c;
            }
        }
    }
}

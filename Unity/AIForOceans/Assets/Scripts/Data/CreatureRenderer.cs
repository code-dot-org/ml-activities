using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Renders sea creatures and trash items (single sprite)
    /// </summary>
    public class CreatureRenderer : MonoBehaviour
    {
        [Header("Sprite Renderer")]
        public SpriteRenderer spriteRenderer;

        [Header("Creature Sprites")]
        public Sprite[] creatureSprites;  // Index matches CREATURE_TYPES
        public Sprite[] trashSprites;     // Index matches TRASH_TYPES

        private OceanObjectData currentData;

        /// <summary>
        /// Set up the visual from data
        /// </summary>
        public void Setup(OceanObjectData data)
        {
            currentData = data;

            if (spriteRenderer == null)
            {
                spriteRenderer = GetComponent<SpriteRenderer>();
            }

            if (spriteRenderer == null) return;

            if (data.objectType == GameConstants.OceanObjectType.Creature)
            {
                SetCreatureSprite(data.subType);
            }
            else if (data.objectType == GameConstants.OceanObjectType.Trash)
            {
                SetTrashSprite(data.subType);
            }
        }

        private void SetCreatureSprite(string creatureType)
        {
            int index = System.Array.IndexOf(GameConstants.CREATURE_TYPES, creatureType);
            if (index >= 0 && creatureSprites != null && index < creatureSprites.Length)
            {
                spriteRenderer.sprite = creatureSprites[index];
            }
        }

        private void SetTrashSprite(string trashType)
        {
            int index = System.Array.IndexOf(GameConstants.TRASH_TYPES, trashType);
            if (index >= 0 && trashSprites != null && index < trashSprites.Length)
            {
                spriteRenderer.sprite = trashSprites[index];
            }
        }

        /// <summary>
        /// Set visibility
        /// </summary>
        public void SetVisible(bool visible)
        {
            gameObject.SetActive(visible);
        }

        /// <summary>
        /// Set sorting order
        /// </summary>
        public void SetSortingOrder(int order)
        {
            if (spriteRenderer != null)
            {
                spriteRenderer.sortingOrder = order;
            }
        }
    }
}

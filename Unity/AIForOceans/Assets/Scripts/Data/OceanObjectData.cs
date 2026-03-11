using System;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Data structure for any ocean object (fish, creature, trash)
    /// </summary>
    [Serializable]
    public class OceanObjectData
    {
        // Basic info
        public int id;
        public GameConstants.OceanObjectType objectType;
        public string name;

        // Fish-specific components (indices into sprite arrays)
        public int bodyIndex;
        public int eyesIndex;
        public int mouthIndex;
        public int dorsalFinIndex;
        public int pectoralFinIndex;
        public int tailFinIndex;
        public int scalesIndex;

        // Colors
        public Color primaryColor;
        public Color secondaryColor;
        public Color finColor;

        // For creatures/trash - the specific type name
        public string subType;

        // Position and animation
        public Vector2 position;
        public float bobPhase;
        public float speed;

        // Classification label (set during training)
        public GameConstants.ClassLabel? label;

        /// <summary>
        /// Create a random fish
        /// </summary>
        public static OceanObjectData CreateRandomFish(int id)
        {
            var fish = new OceanObjectData
            {
                id = id,
                objectType = GameConstants.OceanObjectType.Fish,
                name = $"Fish_{id}",

                // Random component indices
                bodyIndex = UnityEngine.Random.Range(0, GameConstants.BODY_COUNT),
                eyesIndex = UnityEngine.Random.Range(0, GameConstants.EYES_COUNT),
                mouthIndex = UnityEngine.Random.Range(0, GameConstants.MOUTH_COUNT),
                dorsalFinIndex = UnityEngine.Random.Range(0, GameConstants.DORSAL_FIN_COUNT),
                pectoralFinIndex = UnityEngine.Random.Range(0, GameConstants.PECTORAL_FIN_COUNT),
                tailFinIndex = UnityEngine.Random.Range(0, GameConstants.TAIL_FIN_COUNT),
                scalesIndex = UnityEngine.Random.Range(0, 3), // Fewer scale options

                // Random colors
                primaryColor = GetRandomFishColor(),
                secondaryColor = GetRandomFishColor(),
                finColor = GetRandomFishColor(),

                // Animation
                bobPhase = UnityEngine.Random.Range(0f, Mathf.PI * 2f),
                speed = GameConstants.FISH_SPEED * UnityEngine.Random.Range(0.8f, 1.2f)
            };

            return fish;
        }

        /// <summary>
        /// Create a creature
        /// </summary>
        public static OceanObjectData CreateCreature(int id, string creatureType = null)
        {
            if (string.IsNullOrEmpty(creatureType))
            {
                int index = UnityEngine.Random.Range(0, GameConstants.CREATURE_TYPES.Length);
                creatureType = GameConstants.CREATURE_TYPES[index];
            }

            return new OceanObjectData
            {
                id = id,
                objectType = GameConstants.OceanObjectType.Creature,
                name = creatureType,
                subType = creatureType,
                bobPhase = UnityEngine.Random.Range(0f, Mathf.PI * 2f),
                speed = GameConstants.FISH_SPEED * UnityEngine.Random.Range(0.6f, 1.0f)
            };
        }

        /// <summary>
        /// Create trash
        /// </summary>
        public static OceanObjectData CreateTrash(int id, string trashType = null)
        {
            if (string.IsNullOrEmpty(trashType))
            {
                int index = UnityEngine.Random.Range(0, GameConstants.TRASH_TYPES.Length);
                trashType = GameConstants.TRASH_TYPES[index];
            }

            return new OceanObjectData
            {
                id = id,
                objectType = GameConstants.OceanObjectType.Trash,
                name = trashType,
                subType = trashType,
                bobPhase = UnityEngine.Random.Range(0f, Mathf.PI * 2f),
                speed = GameConstants.FISH_SPEED * UnityEngine.Random.Range(0.4f, 0.8f)
            };
        }

        /// <summary>
        /// Get a random fish-appropriate color
        /// </summary>
        private static Color GetRandomFishColor()
        {
            // Predefined fish color palettes
            Color[] fishColors = new Color[]
            {
                new Color(0.2f, 0.6f, 1.0f),   // Blue
                new Color(1.0f, 0.6f, 0.2f),   // Orange
                new Color(0.2f, 0.8f, 0.4f),   // Green
                new Color(0.8f, 0.2f, 0.8f),   // Purple
                new Color(1.0f, 1.0f, 0.2f),   // Yellow
                new Color(1.0f, 0.4f, 0.4f),   // Red/Pink
                new Color(0.4f, 0.8f, 0.8f),   // Cyan
                new Color(0.6f, 0.4f, 0.2f),   // Brown
            };

            return fishColors[UnityEngine.Random.Range(0, fishColors.Length)];
        }

        /// <summary>
        /// Convert to feature vector for classification
        /// </summary>
        public float[] ToFeatureVector()
        {
            if (objectType == GameConstants.OceanObjectType.Fish)
            {
                // Feature vector includes all fish attributes
                return new float[]
                {
                    bodyIndex / (float)GameConstants.BODY_COUNT,
                    eyesIndex / (float)GameConstants.EYES_COUNT,
                    mouthIndex / (float)GameConstants.MOUTH_COUNT,
                    dorsalFinIndex / (float)GameConstants.DORSAL_FIN_COUNT,
                    pectoralFinIndex / (float)GameConstants.PECTORAL_FIN_COUNT,
                    tailFinIndex / (float)GameConstants.TAIL_FIN_COUNT,
                    primaryColor.r,
                    primaryColor.g,
                    primaryColor.b,
                    secondaryColor.r,
                    secondaryColor.g,
                    secondaryColor.b,
                    finColor.r,
                    finColor.g,
                    finColor.b
                };
            }
            else
            {
                // For creatures/trash, use a simpler encoding
                float typeValue = objectType == GameConstants.OceanObjectType.Creature ? 0.5f : 1.0f;
                return new float[] { typeValue, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
            }
        }

        /// <summary>
        /// Check if fish has a specific attribute (for word modes)
        /// </summary>
        public bool HasAttribute(string attribute)
        {
            if (objectType != GameConstants.OceanObjectType.Fish)
                return false;

            attribute = attribute.ToLower();

            return attribute switch
            {
                "blue" => IsColorDominant(Color.blue),
                "orange" => IsColorDominant(new Color(1f, 0.5f, 0f)),
                "green" => IsColorDominant(Color.green),
                "purple" => IsColorDominant(new Color(0.5f, 0f, 0.5f)),
                "yellow" => IsColorDominant(Color.yellow),
                "red" => IsColorDominant(Color.red),
                "striped" => scalesIndex == 1,
                "spotted" => scalesIndex == 2,
                "long" => bodyIndex >= GameConstants.BODY_COUNT / 2,
                "round" => bodyIndex < GameConstants.BODY_COUNT / 2,
                "big" => bodyIndex >= GameConstants.BODY_COUNT * 2 / 3,
                "small" => bodyIndex < GameConstants.BODY_COUNT / 3,
                _ => false
            };
        }

        private bool IsColorDominant(Color targetColor)
        {
            float threshold = 0.4f;
            return ColorDistance(primaryColor, targetColor) < threshold ||
                   ColorDistance(secondaryColor, targetColor) < threshold;
        }

        private float ColorDistance(Color a, Color b)
        {
            return Mathf.Sqrt(
                Mathf.Pow(a.r - b.r, 2) +
                Mathf.Pow(a.g - b.g, 2) +
                Mathf.Pow(a.b - b.b, 2)
            );
        }
    }
}

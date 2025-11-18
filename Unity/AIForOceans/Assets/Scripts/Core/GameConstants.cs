using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Game-wide constants matching the original JavaScript implementation
    /// </summary>
    public static class GameConstants
    {
        // App Modes (Game Levels)
        public enum AppMode
        {
            FishVTrash,           // Basic fish vs trash classification
            CreaturesVTrashDemo,  // Demo showing AI bias
            CreaturesVTrash,      // Fish + creatures vs trash
            Short,                // 6 adjectives, SVM
            Long                  // 15 adjectives, SVM
        }

        // Scene/Mode states
        public enum GameScene
        {
            Loading,
            Words,
            Training,
            Predicting,
            Pond,
            IntermediateLoading
        }

        // Object types in the ocean
        public enum OceanObjectType
        {
            Fish,
            Creature,
            Trash
        }

        // Classification labels
        public enum ClassLabel
        {
            Yes = 1,
            No = 0
        }

        // Fish component counts (matching original)
        public const int BODY_COUNT = 19;
        public const int EYES_COUNT = 18;
        public const int MOUTH_COUNT = 15;
        public const int DORSAL_FIN_COUNT = 17;
        public const int PECTORAL_FIN_COUNT = 17;
        public const int TAIL_FIN_COUNT = 17;

        // Creature types
        public static readonly string[] CREATURE_TYPES = new string[]
        {
            "Crab", "Dolphin", "Jellyfish", "Octopus", "Otter",
            "Seahorse", "Snail", "Starfish", "Turtle", "Whale"
        };

        // Trash types
        public static readonly string[] TRASH_TYPES = new string[]
        {
            "6-pack-rings", "Apple", "Banana", "Battery", "Bottle",
            "Bulb", "Can", "Coffee", "Fork", "Laundry", "Sock",
            "Soda", "Tire", "Wing"
        };

        // Word choices for Short mode (6 adjectives)
        public static readonly string[] SHORT_WORDS = new string[]
        {
            "blue", "orange", "striped", "spotted", "long", "round"
        };

        // Word choices for Long mode (15 adjectives)
        public static readonly string[] LONG_WORDS = new string[]
        {
            "blue", "orange", "striped", "spotted", "long", "round",
            "green", "purple", "scary", "friendly", "big", "small",
            "fast", "slow", "colorful"
        };

        // Animation constants
        public const float BOB_AMPLITUDE = 10f;
        public const float BOB_FREQUENCY = 2f;
        public const float FISH_SPEED = 100f;
        public const float SCAN_PAUSE_DURATION = 1.5f;

        // Training counts per mode
        public const int FISH_V_TRASH_TRAINING_COUNT = 6;
        public const int CREATURES_V_TRASH_TRAINING_COUNT = 8;
        public const int SHORT_TRAINING_COUNT = 30;
        public const int LONG_TRAINING_COUNT = 100;

        // UI constants
        public const float CANVAS_WIDTH = 400f;
        public const float CANVAS_HEIGHT = 400f;
        public const float UI_SCALE_FACTOR = 1f;

        // Prediction confidence thresholds
        public const float HIGH_CONFIDENCE_THRESHOLD = 0.7f;
        public const float LOW_CONFIDENCE_THRESHOLD = 0.3f;

        // Colors for prediction frames
        public static readonly Color GREEN_FRAME = new Color(0.2f, 0.8f, 0.2f);   // Correct/Yes
        public static readonly Color RED_FRAME = new Color(0.8f, 0.2f, 0.2f);     // Wrong/No
        public static readonly Color BLUE_FRAME = new Color(0.2f, 0.4f, 0.8f);    // Uncertain
    }
}

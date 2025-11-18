using System.Collections.Generic;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Simple localization system
    /// </summary>
    public class Localization : MonoBehaviour
    {
        public static Localization Instance { get; private set; }

        [Header("Settings")]
        public string currentLanguage = "en";
        public TextAsset[] localizationFiles;

        private Dictionary<string, Dictionary<string, string>> localizedStrings;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            LoadLocalizations();
        }

        private void LoadLocalizations()
        {
            localizedStrings = new Dictionary<string, Dictionary<string, string>>();

            // Default English strings
            var englishStrings = new Dictionary<string, string>
            {
                // Training
                { "training.fish_v_trash", "Is this a fish?" },
                { "training.creatures_v_trash", "Should this stay in the ocean?" },
                { "training.word_mode", "Is this fish {0}?" },

                // Buttons
                { "button.yes", "Yes" },
                { "button.no", "No" },
                { "button.continue", "Continue" },
                { "button.skip", "Skip" },
                { "button.back", "Back" },

                // Scenes
                { "scene.loading", "Loading..." },
                { "scene.training_complete", "Training complete!" },
                { "scene.analyzing", "AI is analyzing..." },

                // Results
                { "results.accuracy", "Accuracy: {0}%" },
                { "results.correct", "Correct" },
                { "results.incorrect", "Incorrect" },
                { "results.uncertain", "Uncertain" },

                // Guide messages
                { "guide.training_start", "Help the AI learn! Click YES if it's a fish, NO if it's trash." },
                { "guide.prediction_start", "Watch the AI make predictions based on what you taught it!" },
                { "guide.pond_results", "See how the AI did! Green means correct, red means wrong." },
                { "guide.word_selection", "Pick a word. You'll teach the AI what this word means for fish." },

                // Menu
                { "menu.title", "AI for Oceans" },
                { "menu.fish_v_trash", "Fish vs Trash" },
                { "menu.creatures_v_trash", "Creatures vs Trash" },
                { "menu.short_mode", "Quick Game" },
                { "menu.long_mode", "Full Game" }
            };

            localizedStrings["en"] = englishStrings;

            // Load additional languages from text assets
            foreach (var file in localizationFiles)
            {
                if (file != null)
                {
                    LoadLocalizationFile(file);
                }
            }
        }

        private void LoadLocalizationFile(TextAsset file)
        {
            // Simple JSON parsing (would use JsonUtility in real implementation)
            // For now, this is a placeholder
        }

        /// <summary>
        /// Get localized string
        /// </summary>
        public string Get(string key)
        {
            if (localizedStrings.TryGetValue(currentLanguage, out var strings))
            {
                if (strings.TryGetValue(key, out string value))
                {
                    return value;
                }
            }

            // Fallback to English
            if (localizedStrings.TryGetValue("en", out var englishStrings))
            {
                if (englishStrings.TryGetValue(key, out string value))
                {
                    return value;
                }
            }

            // Return key if not found
            return key;
        }

        /// <summary>
        /// Get localized string with format arguments
        /// </summary>
        public string Get(string key, params object[] args)
        {
            string format = Get(key);
            return string.Format(format, args);
        }

        /// <summary>
        /// Set current language
        /// </summary>
        public void SetLanguage(string languageCode)
        {
            currentLanguage = languageCode;
        }
    }
}

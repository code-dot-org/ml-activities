using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Initializes the game on startup
    /// </summary>
    public class GameInitializer : MonoBehaviour
    {
        [Header("Managers")]
        public GameObject gameManagerPrefab;
        public GameObject soundManagerPrefab;
        public GameObject localizationPrefab;

        [Header("Initial Settings")]
        public GameConstants.AppMode defaultMode = GameConstants.AppMode.FishVTrash;
        public bool autoStartGame = false;

        private void Awake()
        {
            // Ensure managers exist
            EnsureManagerExists<GameManager>(gameManagerPrefab);
            EnsureManagerExists<SoundManager>(soundManagerPrefab);
            EnsureManagerExists<Localization>(localizationPrefab);
        }

        private void Start()
        {
            if (autoStartGame && GameManager.Instance != null)
            {
                GameManager.Instance.StartGame(defaultMode);
            }
        }

        private void EnsureManagerExists<T>(GameObject prefab) where T : MonoBehaviour
        {
            if (FindFirstObjectByType<T>() == null)
            {
                if (prefab != null)
                {
                    Instantiate(prefab);
                }
                else
                {
                    // Create empty manager
                    var obj = new GameObject(typeof(T).Name);
                    obj.AddComponent<T>();
                }
            }
        }
    }
}

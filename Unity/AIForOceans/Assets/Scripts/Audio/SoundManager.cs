using System.Collections.Generic;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Manages all game audio - sound effects and music
    /// </summary>
    public class SoundManager : MonoBehaviour
    {
        public static SoundManager Instance { get; private set; }

        [Header("Audio Sources")]
        public AudioSource sfxSource;
        public AudioSource musicSource;

        [Header("Sound Clips")]
        public AudioClip[] yesClips;
        public AudioClip[] noClips;
        public AudioClip[] sortYesClips;
        public AudioClip[] sortNoClips;
        public AudioClip buttonClick;
        public AudioClip scanSound;
        public AudioClip resultSound;

        [Header("Settings")]
        [Range(0f, 1f)]
        public float sfxVolume = 1f;
        [Range(0f, 1f)]
        public float musicVolume = 0.5f;

        private Dictionary<string, AudioClip[]> soundCategories;

        private void Awake()
        {
            // Singleton
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            // Set up audio sources if not assigned
            if (sfxSource == null)
            {
                sfxSource = gameObject.AddComponent<AudioSource>();
                sfxSource.playOnAwake = false;
            }

            if (musicSource == null)
            {
                musicSource = gameObject.AddComponent<AudioSource>();
                musicSource.playOnAwake = false;
                musicSource.loop = true;
            }

            // Organize sounds into categories
            soundCategories = new Dictionary<string, AudioClip[]>
            {
                { "yes", yesClips },
                { "no", noClips },
                { "sortyes", sortYesClips },
                { "sortno", sortNoClips }
            };
        }

        /// <summary>
        /// Play a random sound from a category
        /// </summary>
        public void PlayRandomFromCategory(string category)
        {
            if (soundCategories.TryGetValue(category.ToLower(), out AudioClip[] clips))
            {
                if (clips != null && clips.Length > 0)
                {
                    int index = Random.Range(0, clips.Length);
                    PlaySFX(clips[index]);
                }
            }
        }

        /// <summary>
        /// Play a specific sound effect
        /// </summary>
        public void PlaySFX(AudioClip clip)
        {
            if (clip != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(clip, sfxVolume);
            }
        }

        /// <summary>
        /// Play button click sound
        /// </summary>
        public void PlayButtonClick()
        {
            PlaySFX(buttonClick);
        }

        /// <summary>
        /// Play yes training sound
        /// </summary>
        public void PlayYes()
        {
            PlayRandomFromCategory("yes");
        }

        /// <summary>
        /// Play no training sound
        /// </summary>
        public void PlayNo()
        {
            PlayRandomFromCategory("no");
        }

        /// <summary>
        /// Play sort yes sound (during prediction)
        /// </summary>
        public void PlaySortYes()
        {
            PlayRandomFromCategory("sortyes");
        }

        /// <summary>
        /// Play sort no sound (during prediction)
        /// </summary>
        public void PlaySortNo()
        {
            PlayRandomFromCategory("sortno");
        }

        /// <summary>
        /// Play scan/analyze sound
        /// </summary>
        public void PlayScan()
        {
            PlaySFX(scanSound);
        }

        /// <summary>
        /// Play result reveal sound
        /// </summary>
        public void PlayResult()
        {
            PlaySFX(resultSound);
        }

        /// <summary>
        /// Set SFX volume
        /// </summary>
        public void SetSFXVolume(float volume)
        {
            sfxVolume = Mathf.Clamp01(volume);
        }

        /// <summary>
        /// Set music volume
        /// </summary>
        public void SetMusicVolume(float volume)
        {
            musicVolume = Mathf.Clamp01(volume);
            if (musicSource != null)
            {
                musicSource.volume = musicVolume;
            }
        }

        /// <summary>
        /// Play background music
        /// </summary>
        public void PlayMusic(AudioClip music)
        {
            if (musicSource != null && music != null)
            {
                musicSource.clip = music;
                musicSource.volume = musicVolume;
                musicSource.Play();
            }
        }

        /// <summary>
        /// Stop background music
        /// </summary>
        public void StopMusic()
        {
            if (musicSource != null)
            {
                musicSource.Stop();
            }
        }

        /// <summary>
        /// Fade out music over time
        /// </summary>
        public void FadeOutMusic(float duration)
        {
            StartCoroutine(FadeOutCoroutine(duration));
        }

        private System.Collections.IEnumerator FadeOutCoroutine(float duration)
        {
            float startVolume = musicSource.volume;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                musicSource.volume = Mathf.Lerp(startVolume, 0f, elapsed / duration);
                yield return null;
            }

            musicSource.Stop();
            musicSource.volume = startVolume;
        }
    }
}

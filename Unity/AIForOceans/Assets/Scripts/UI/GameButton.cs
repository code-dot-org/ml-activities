using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace AIForOceans
{
    /// <summary>
    /// Custom button with states and feedback
    /// </summary>
    public class GameButton : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler, IPointerDownHandler, IPointerUpHandler
    {
        [Header("Button Settings")]
        public string buttonId;
        public bool playSound = true;

        [Header("Visual Settings")]
        public Color normalColor = Color.white;
        public Color hoverColor = new Color(0.9f, 0.9f, 0.9f);
        public Color pressedColor = new Color(0.7f, 0.7f, 0.7f);
        public Color disabledColor = new Color(0.5f, 0.5f, 0.5f, 0.5f);

        [Header("Animation")]
        public float scaleOnPress = 0.95f;
        public float animationSpeed = 10f;

        // Events
        public event Action OnClicked;
        public event Action OnPressed;
        public event Action OnReleased;

        // Components
        private Image image;
        private Button button;
        private RectTransform rectTransform;

        // State
        private bool isHovered = false;
        private bool isPressed = false;
        private bool isInteractable = true;
        private Vector3 originalScale;
        private Vector3 targetScale;

        private void Awake()
        {
            image = GetComponent<Image>();
            button = GetComponent<Button>();
            rectTransform = GetComponent<RectTransform>();

            if (rectTransform != null)
            {
                originalScale = rectTransform.localScale;
                targetScale = originalScale;
            }

            if (button != null)
            {
                button.onClick.AddListener(HandleClick);
            }
        }

        private void Update()
        {
            // Smooth scale animation
            if (rectTransform != null)
            {
                rectTransform.localScale = Vector3.Lerp(
                    rectTransform.localScale,
                    targetScale,
                    Time.deltaTime * animationSpeed
                );
            }
        }

        public void OnPointerEnter(PointerEventData eventData)
        {
            if (!isInteractable) return;

            isHovered = true;
            UpdateVisual();
        }

        public void OnPointerExit(PointerEventData eventData)
        {
            isHovered = false;
            isPressed = false;
            UpdateVisual();
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            if (!isInteractable) return;

            isPressed = true;
            targetScale = originalScale * scaleOnPress;
            UpdateVisual();
            OnPressed?.Invoke();
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            isPressed = false;
            targetScale = originalScale;
            UpdateVisual();
            OnReleased?.Invoke();
        }

        private void HandleClick()
        {
            if (!isInteractable) return;

            if (playSound && SoundManager.Instance != null)
            {
                SoundManager.Instance.PlayButtonClick();
            }

            OnClicked?.Invoke();
        }

        private void UpdateVisual()
        {
            if (image == null) return;

            if (!isInteractable)
            {
                image.color = disabledColor;
            }
            else if (isPressed)
            {
                image.color = pressedColor;
            }
            else if (isHovered)
            {
                image.color = hoverColor;
            }
            else
            {
                image.color = normalColor;
            }
        }

        /// <summary>
        /// Set button interactable state
        /// </summary>
        public void SetInteractable(bool interactable)
        {
            isInteractable = interactable;
            if (button != null)
            {
                button.interactable = interactable;
            }
            UpdateVisual();
        }

        /// <summary>
        /// Set button colors
        /// </summary>
        public void SetColors(Color normal, Color hover, Color pressed)
        {
            normalColor = normal;
            hoverColor = hover;
            pressedColor = pressed;
            UpdateVisual();
        }
    }
}

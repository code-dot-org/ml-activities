# AI For Oceans - Unity Port

A Unity port of Code.org's "AI for Oceans" educational machine learning game.

## Overview

This is a complete Unity conversion of the original JavaScript/React web application. It teaches students about:
- Machine learning and AI classification
- Training bias and data labeling
- How AI learns from examples

## Project Structure

```
Unity/AIForOceans/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/           # GameManager, SceneController, Constants
│   │   ├── Data/           # OceanObjectData, generators
│   │   ├── Classification/ # NaiveKNN, NaiveSVM classifiers
│   │   ├── Animation/      # FishAnimator, FishRenderer
│   │   ├── UI/             # All UI components
│   │   ├── Audio/          # SoundManager
│   │   ├── Scenes/         # Scene controllers
│   │   └── Utils/          # Localization, utilities
│   ├── Sprites/            # All image assets
│   ├── Audio/              # All sound effects
│   ├── Prefabs/            # Reusable prefabs
│   └── Scenes/             # Unity scenes
├── ProjectSettings/        # Unity project settings
└── README.md
```

## Game Modes

1. **Fish vs Trash** - Basic classification: Is this a fish?
2. **Creatures vs Trash Demo** - Shows AI bias with untrained examples
3. **Creatures vs Trash** - Extended classification with sea creatures
4. **Short Mode** - Pick from 6 adjectives to train (SVM)
5. **Long Mode** - Pick from 15 adjectives for deeper training (SVM)

## Classification System

This port uses **naive classification** instead of TensorFlow ML:

### NaiveKNNClassifier
- Stores training examples with their feature vectors
- Predicts by finding K nearest neighbors
- Uses Euclidean distance on normalized fish attributes

### NaiveSVMClassifier
- Computes mean feature vectors per class
- Weights features by discriminative power
- Simple linear decision boundary

Both classifiers provide the same user experience as the original ML implementation but are much simpler to understand and maintain.

## Setup Instructions

### Requirements
- Unity 2022.3 LTS or newer
- TextMeshPro package (included in Unity)

### Getting Started

1. Open Unity Hub
2. Click "Add" and select the `Unity/AIForOceans` folder
3. Open the project in Unity
4. Open the main scene: `Assets/Scenes/MainScene.unity`
5. Press Play to test

### Creating the Scene

Since this is a code-first port, you'll need to set up the scene:

1. Create a new scene
2. Add a `GameInitializer` to an empty GameObject
3. Add a `GameManager` (will be created automatically)
4. Create UI Canvas with:
   - MainMenuUI
   - TrainingUI
   - PredictionUI
   - PondUI
   - WordSelectionUI
   - GuideUI
5. Create a Fish prefab with:
   - FishRenderer (with SpriteRenderer children for each part)
   - FishAnimator
6. Create an AIBot prefab with:
   - AIBot script
   - Expression sprites
7. Assign sprite arrays in the Inspector

## Key Scripts

### Core
- `GameManager.cs` - Singleton managing game state
- `GameState.cs` - Central state data structure
- `GameConstants.cs` - All constants and enums
- `SceneController.cs` - Handles scene transitions

### Classification
- `ITrainer.cs` - Interface for classifiers
- `NaiveKNNClassifier.cs` - K-Nearest Neighbors implementation
- `NaiveSVMClassifier.cs` - Support Vector Machine-like classifier

### Data
- `OceanObjectData.cs` - Fish/creature/trash data
- `OceanGenerator.cs` - Procedural generation
- `FishRenderer.cs` - Sprite assembly for fish

### UI
- `TrainingUI.cs` - Yes/No training interface
- `PredictionUI.cs` - AI analysis display
- `PondUI.cs` - Results visualization
- `GuideUI.cs` - Tutorial system with typing effect

## Differences from Original

1. **No ML Framework** - Uses simple attribute matching instead of TensorFlow
2. **Unity Native** - Uses Unity UI, Audio, and animation systems
3. **C# Implementation** - Fully typed, compiled code
4. **Prefab-based** - Fish components use Unity prefab system

## Building

### WebGL (like original)
1. File → Build Settings
2. Select WebGL
3. Click Build

### Mobile
1. File → Build Settings
2. Select Android/iOS
3. Configure player settings
4. Build

## Credits

- Original: Code.org "AI for Oceans"
- Unity Port: Converted from JavaScript/React

## License

Educational use - see Code.org terms

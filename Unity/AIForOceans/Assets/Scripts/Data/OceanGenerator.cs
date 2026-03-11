using System.Collections.Generic;
using UnityEngine;

namespace AIForOceans
{
    /// <summary>
    /// Generates random ocean objects for the game
    /// </summary>
    public class OceanGenerator
    {
        /// <summary>
        /// Generate a collection of ocean objects
        /// </summary>
        public List<OceanObjectData> GenerateOcean(
            int count,
            bool includeFish = true,
            bool includeCreatures = false,
            bool includeTrash = true)
        {
            var objects = new List<OceanObjectData>();

            for (int i = 0; i < count; i++)
            {
                OceanObjectData obj = GenerateRandomObject(i, includeFish, includeCreatures, includeTrash);
                objects.Add(obj);
            }

            // Shuffle the list
            ShuffleList(objects);

            return objects;
        }

        /// <summary>
        /// Generate a single random object based on allowed types
        /// </summary>
        private OceanObjectData GenerateRandomObject(
            int id,
            bool includeFish,
            bool includeCreatures,
            bool includeTrash)
        {
            // Build list of possible types
            var possibleTypes = new List<GameConstants.OceanObjectType>();

            if (includeFish)
                possibleTypes.Add(GameConstants.OceanObjectType.Fish);
            if (includeCreatures)
                possibleTypes.Add(GameConstants.OceanObjectType.Creature);
            if (includeTrash)
                possibleTypes.Add(GameConstants.OceanObjectType.Trash);

            if (possibleTypes.Count == 0)
            {
                // Default to fish if nothing selected
                return OceanObjectData.CreateRandomFish(id);
            }

            // Weight fish higher for better game balance
            if (includeFish && (includeCreatures || includeTrash))
            {
                // 60% fish, rest split between others
                float roll = Random.value;
                if (roll < 0.6f)
                {
                    return OceanObjectData.CreateRandomFish(id);
                }
                else if (includeCreatures && includeTrash)
                {
                    if (roll < 0.8f)
                        return OceanObjectData.CreateCreature(id);
                    else
                        return OceanObjectData.CreateTrash(id);
                }
                else if (includeCreatures)
                {
                    return OceanObjectData.CreateCreature(id);
                }
                else
                {
                    return OceanObjectData.CreateTrash(id);
                }
            }

            // Equal distribution
            var selectedType = possibleTypes[Random.Range(0, possibleTypes.Count)];

            return selectedType switch
            {
                GameConstants.OceanObjectType.Fish => OceanObjectData.CreateRandomFish(id),
                GameConstants.OceanObjectType.Creature => OceanObjectData.CreateCreature(id),
                GameConstants.OceanObjectType.Trash => OceanObjectData.CreateTrash(id),
                _ => OceanObjectData.CreateRandomFish(id)
            };
        }

        /// <summary>
        /// Generate objects specifically for training
        /// </summary>
        public List<OceanObjectData> GenerateTrainingSet(
            int count,
            GameConstants.AppMode mode)
        {
            bool includeFish = true;
            bool includeCreatures = mode == GameConstants.AppMode.CreaturesVTrash ||
                                   mode == GameConstants.AppMode.CreaturesVTrashDemo;
            bool includeTrash = mode != GameConstants.AppMode.Short &&
                               mode != GameConstants.AppMode.Long;

            // For word modes, only fish
            if (mode == GameConstants.AppMode.Short || mode == GameConstants.AppMode.Long)
            {
                includeCreatures = false;
                includeTrash = false;
            }

            return GenerateOcean(count, includeFish, includeCreatures, includeTrash);
        }

        /// <summary>
        /// Generate objects for prediction phase
        /// </summary>
        public List<OceanObjectData> GeneratePredictionSet(
            int count,
            GameConstants.AppMode mode)
        {
            // Similar to training but may have different distribution
            return GenerateTrainingSet(count, mode);
        }

        /// <summary>
        /// Fisher-Yates shuffle
        /// </summary>
        private void ShuffleList<T>(List<T> list)
        {
            for (int i = list.Count - 1; i > 0; i--)
            {
                int j = Random.Range(0, i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }
    }
}

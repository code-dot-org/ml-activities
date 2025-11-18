namespace AIForOceans
{
    /// <summary>
    /// Interface for all classifiers (naive implementations)
    /// </summary>
    public interface ITrainer
    {
        /// <summary>
        /// Add a training example
        /// </summary>
        void AddExample(OceanObjectData data, GameConstants.ClassLabel label);

        /// <summary>
        /// Train the model (optional for some classifiers)
        /// </summary>
        void Train();

        /// <summary>
        /// Make a prediction
        /// </summary>
        (bool prediction, float confidence) Predict(OceanObjectData data);

        /// <summary>
        /// Get count of examples for a class
        /// </summary>
        int GetExampleCount(GameConstants.ClassLabel label);

        /// <summary>
        /// Clear all training data
        /// </summary>
        void ClearAll();
    }
}

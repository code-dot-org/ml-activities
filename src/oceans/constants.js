const constants = {
  canvasWidth: 1024,
  canvasHeight: 576,
  fishCanvasWidth: 300,
  fishCanvasHeight: 200,
  fishFrameSize: 210,
  defaultMoveTime: 1000,
  maxPondFish: 20,
  minLoadingTime: 1500
};

export default constants;

export const AppMode = Object.freeze({
  FishVTrash: 'fishvtrash',
  CreaturesVTrashDemo: 'creaturesvtrashdemo',
  CreaturesVTrash: 'creaturesvtrash',
  FishShort: 'short',
  FishLong: 'long'
});

export const Modes = Object.freeze({
  Loading: 0,
  Words: 1,
  Training: 2,
  Predicting: 3,
  Pond: 4,
  Instructions: 5,
  IntermediateLoading: 6
});

export const ClassType = Object.freeze({
  Like: 0,
  Dislike: 1
});

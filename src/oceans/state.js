let setStateCallback = null;

const initialState = {
  appMode: null,
  currentMode: null,
  fishData: [],
  pondFish: [],
  recallFish: [],
  showRecallFish: false,
  totalPondFish: null,
  backgroundCanvas: null,
  canvas: null,
  ctx: null,
  trainer: null,
  trainingIndex: 0,
  isRunning: false,
  isPaused: false,
  moveTime: 1000,
  lastStartTime: null,
  lastPauseTime: 0,
  runStartTime: null,
  biasTextTime: null,
  canSkipPredict: null,
  canSeePondText: null,
  canSkipPond: null,
  yesCount: 0,
  noCount: 0,
  loadTrashImages: null,
  word: null,
  trainingQuestion: null,
  currentInstructionsPage: 0,
  pondFishBounds: null,
  pondClickedFish: null,
  pondPanelShowing: false,
  pondPanelSide: null,
  pondFishMaxExplainValue: 1,
  pondRecallFishMaxExplainValue: 1,
  guideDismissals: [],
  guideShowing: false,
  showConfirmationDialog: false,
  confirmationDialogOnYes: null,
  textToSpeechLocale: undefined,
  // Whether text to speech has ever been successfully
  // started via a user click.
  textToSpeechStartedViaClick: false,
  // The current guide, if any, being played as text
  // to speech.
  textToSpeechCurrentGuide: undefined
};
let state = {...initialState};

export const getState = function() {
  return state;
};

export const setState = function(newState, options = null) {
  return setStateInternal({...state, ...newState}, options);
};

export const setInitialState = function(newState) {
  return setStateInternal({...initialState, ...newState});
};

function setStateInternal(newState, options = null) {
  state = newState;

  if (setStateCallback && !(options && options.skipCallback)) {
    setStateCallback();
  }

  return state;
}

export const setSetStateCallback = callback => {
  setStateCallback = callback;
};

export const resetState = () => {
  state = {...initialState};
  return state;
};

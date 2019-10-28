import 'babel-polyfill';
import $ from 'jquery';
import {setState} from '../state';
import {Modes} from '../constants';
import {createButton, createText, createImage, toMode} from '../helpers';
import {generateOcean} from '../../utils/generateOcean';

const headerElements = [createText({id: 'header', text: 'A.I. Sorting'})];
const uiElements = [
  createImage({
    id: 'predict-ai-bot',
    src: 'images/ai-bot-closed.png'
  })
];
const footerElements = [
  createButton({
    text: 'Training',
    onClick: () => toMode(Modes.Training),
    className: ''
  }),
  createButton({
    text: 'Continue',
    onClick: () => toMode(Modes.Pond),
    className: ''
  }),
  createButton({
    text: 'Show Code',
    id: 'show-code',
    onClick: () => showCode(true),
    className: 'show-code-toggle'
  }),
  createButton({
    text: 'Hide Code',
    id: 'hide-code',
    onClick: () => showCode(false),
    className: 'show-code-toggle',
    show: false
  })
];

export const init = () => {
  const fishData = generateOcean(100, true);
  setState({fishData, headerElements, uiElements, footerElements, isRunning: true});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];
    state.trainer.predictFromData(fish.getKnnData()).then(prediction => {
      fish.setResult(prediction);
      resolve(prediction);
    });
  });
};

const showCode = show => {
  setState({showCode: show});
  if (show) {
    $('#hide-code').show();
    $('#show-code').hide();
    // Fade in the code.  Stop the current and any pending jquery animations.
    $('#code')
      .stop(true, true)
      .fadeIn();
  } else {
    $('#show-code').show();
    $('#hide-code').hide();
    // Fade out the code.  Stop the current and any pending jquery animations.
    $('#code')
      .stop(true, true)
      .fadeOut();
  }
};

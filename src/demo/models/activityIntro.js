import 'babel-polyfill';
import {setState} from '../state';
import {Modes} from '../constants';
import {createButton, createImage, createText, toMode} from '../helpers';


const onContinueClick = () => {
  setState({word: 'test'});
  toMode(Modes.TrainingIntro);
}

export const init = () => {
  const footerElements = [
    createButton({
      text: 'Continue',
      onClick: onContinueClick,
      className: 'continue-end'
    })
  ];
  const uiElements = [
    createText({
      id: 'activity-intro-text',
      text:
        '<b>Meet A.I.</b><br><br>Machine learning and Artificial Intelligence (AI) can give recommendations, like when a computer suggests videos to watch or products to buy. What else can we teach a computer?<br><br>Next, you’re going to teach A.I. a new word just by showing examples of that type of fish.'
    }),
    createImage({
      id: 'activity-intro-ai-bot',
      src: 'images/ai-bot-closed.png'
    })
  ];
  setState({uiElements, footerElements});
};

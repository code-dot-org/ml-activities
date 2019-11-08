import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import _ from 'lodash';
import {getState, setState} from './state';
import constants, {AppMode, Modes} from './constants';
import {getAppMode} from './helpers';
import {toMode} from './toMode';
import {onClassifyFish} from './models/train';
import colors from './colors';
import aiBotClosed from '../../public/images/ai-bot/ai-bot-closed.png';
import xIcon from '../../public/images/x-icon.png';
import checkmarkIcon from '../../public/images/checkmark-icon.png';
import Typist from 'react-typist';
import {getCurrentGuide, dismissGuide} from './models/guide';

const styles = {
  header: {
    position: 'absolute',
    top: 10,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    lineHeight: '52px'
  },
  body: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%' // for 16:9
  },
  content: {
    position: 'absolute',
    top: '10%',
    left: 0,
    width: '100%'
  },
  button: {
    cursor: 'pointer',
    backgroundColor: colors.white,
    fontSize: '120%',
    borderRadius: 8,
    minWidth: 160,
    padding: '16px 30px',
    outline: 'none',
    border: `2px solid ${colors.black}`,
    ':focus': {
      outline: `${colors.white} auto 5px`
    }
  },
  continueButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.orange,
    color: colors.white
  },
  backButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: colors.blue,
    color: colors.white
  },
  button1col: {
    width: '20%',
    display: 'block',
    margin: '2% auto'
  },
  button3col: {
    width: '20%',
    marginLeft: '6%',
    marginRight: '6%',
    marginTop: '2%'
  },
  instructionsText: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%'
  },
  instructionsFooter: {
    textAlign: 'center'
  },
  instructionsParagraph: {
    marginTop: 18,
    marginBottom: 18
  },
  activityIntroText: {
    position: 'absolute',
    fontSize: 22,
    lineHeight: '26px',
    top: '20%',
    left: '50%',
    width: '80%',
    transform: 'translateX(-50%)',
    textAlign: 'center'
  },
  trainingIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '30%',
    left: '50%'
  },
  activityIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '50%',
    left: '50%'
  },
  wordsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 22,
    lineHeight: '26px'
  },
  trainQuestionText: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 32,
    lineHeight: '35px'
  },
  trainQuestionTextDisabled: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 32,
    lineHeight: '35px',
    opacity: 0.5
  },
  trainButtons: {
    position: 'absolute',
    top: '80%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  trainButtonYes: {
    marginLeft: 10,
    ':hover': {
      backgroundColor: colors.green,
      color: colors.white
    }
  },
  trainButtonNo: {
    ':hover': {
      backgroundColor: colors.red,
      color: colors.white
    }
  },
  trainBot: {
    position: 'absolute',
    height: '40%',
    top: '28%',
    left: '76%'
  },
  predictSpeech: {
    top: '88%',
    left: '12%',
    width: '65%',
    height: 38
  },
  pondText: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 18,
    lineHeight: '22px',
    textAlign: 'center',
    width: '45%',
    backgroundColor: colors.transparentBlack,
    padding: '1%',
    borderRadius: 10,
    color: colors.white
  },
  pondTextParagraph: {
    marginBottom: 4
  },
  pondFishDetails: {
    position: 'absolute',
    backgroundColor: colors.transparentWhite,
    padding: '2%',
    borderRadius: 5,
    color: colors.black
  },
  pondBot: {
    position: 'absolute',
    height: '40%',
    top: '23%',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-45%)'
  },
  pill: {
    display: 'flex',
    alignItems: 'center'
  },
  pillIcon: {
    width: 19,
    padding: 10,
    borderRadius: 33
  },
  pillText: {
    color: colors.black,
    padding: '10px 30px',
    borderRadius: 33,
    marginLeft: -18
  },
  bubble: {
    position: 'absolute',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    padding: '10px 20px',
    borderRadius: 10,
    top: 0,
    width: 212,
    textAlign: 'center'
  },
  count: {
    position: 'absolute',
    top: '3%'
  },
  noCount: {
    right: '9%'
  },
  yesCount: {
    right: 0
  },
  guide: {
    position: 'absolute',
    backgroundColor: colors.darkBlue,
    padding: 15,
    color: 'white'
  },
  guideBackground: {
    backgroundColor: colors.transparentBlack,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  guideTopLeft: {
    top: '5%',
    left: '5%',
  },
  guideBottomMiddle: {
    bottom: '5%',
    left: '50%',
    transform: 'translateX(-50%)'
  }
};

function Collide(x1, y1, w1, h1, x2, y2, w2, h2) {
  // Detect a non-collision.
  if (
    x1 + w1 - 1 < x2 ||
    x1 > x2 + w2 - 1 ||
    y1 + h1 - 1 < y2 ||
    y1 > y2 + h2 - 1
  ) {
    return false;
  }

  // Otherwise we have a collision.
  return true;
}

var $time =
  Date.now ||
  function() {
    return +new Date();
  };

class Body extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func
  };

  render() {
    return (
      <div style={styles.body} onClick={this.props.onClick}>
        {this.props.children}
        <Guide />
      </div>
    );
  }
}

class Header extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div style={styles.header}>{this.props.children}</div>;
  }
}

class Content extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div style={styles.content}>{this.props.children}</div>;
  }
}

let Button = class Button extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func
  };

  render() {
    return (
      <button
        type="button"
        style={[styles.button, this.props.style]}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
};
Button = Radium(Button);

const instructionsText = {
  fishvtrash: [
    {
      heading: 'Train AI to Clean the Ocean',
      text: [
        'In the following activity we’ll learn about artificial intelligence (AI) and machine learning.',
        'Now let’s consider how machine learning can be used for good in the real world.',
        '1 in 3 people worldwide do not have access to safe drinking water. Access to clean water could reduce global diseases by 10%.',
        'Garbage dumped in ocean or rivers affects the water health and impacts the marine life in the water.',
        'In this activity, you will "program" or "train" an artificial intelligence to identify trash to remove from the ocean.'
      ],
      footer:
        'Sources <a href="https://www.cdc.gov/healthywater/global/assessing.html" target="_blank">X</a>, <a href="https://unfoundation.org/blog/post/tapping-benefits-clean-water-sanitation-hygiene-achieve-sustainable-development-goals/" target="_blank">Y</a>, <a href="https://www.unwater.org/water-facts/water-sanitation-and-hygiene/" target="_blank">Z</a>'
    },
    {
      heading: 'Meet A.I.',
      text: [
        "A.I. can't tell if an object is a fish or a piece of trash yet, but it can process different images and identify patterns.",
        'To program A.I., label the images we show you as either "fish" or "not fish". This will train A.I. to do it on its own!'
      ],
      image: aiBotClosed
    }
  ],

  short: [
    {
      heading: 'Training Data',
      text: [
        'A.I. needs lots of training data to do its job well. When you train A.I., the data you provide can make a difference!',
        'We learned how AI and machine learning can be used to do good things like identify trash in the ocean!',
        'What else can we use AI to do?'
      ]
    },
    {
      heading: 'Training Data',
      text: [
        'AI and machine learning can also be used to give recommendations, like when a computer suggests videos to watch or products to buy.',
        'Next, you’re going to teach A.I. a new word just by showing examples of that type of fish.'
      ]
    }
  ]
};

class Instructions extends React.Component {
  setInstructionsPage(page) {
    setState({currentInstructionsPage: page});
  }

  onContinueButton = () => {
    const state = getState();
    const {onContinue, currentInstructionsPage} = state;
    const [, appModeVariant] = getAppMode(state);
    const numPages = instructionsText[appModeVariant].length;

    if (currentInstructionsPage < numPages - 1) {
      this.setInstructionsPage(currentInstructionsPage + 1);
      return;
    }
    if (onContinue) {
      onContinue();
    }
  };

  render() {
    const state = getState();
    const currentPage = state.currentInstructionsPage;
    const [, appModeVariant] = getAppMode(state);

    return (
      <Body>
        <Header>{instructionsText[appModeVariant][currentPage].heading}</Header>
        <div style={styles.instructionsText}>
          {instructionsText[appModeVariant][currentPage].text.map(
            (instruction, index) => {
              return (
                <div key={index} style={styles.instructionsParagraph}>
                  {instruction}
                </div>
              );
            }
          )}
          {instructionsText[appModeVariant][currentPage].image && (
            <div style={styles.instructionsFooter}>
              <img src={instructionsText[appModeVariant][currentPage].image} />
            </div>
          )}
          {instructionsText[appModeVariant][currentPage].footer && (
            <div
              style={styles.instructionsFooter}
              dangerouslySetInnerHTML={{
                __html: instructionsText[appModeVariant][currentPage].footer
              }}
            />
          )}
        </div>
        <Button style={styles.continueButton} onClick={this.onContinueButton}>
          Continue
        </Button>
      </Body>
    );
  }
}

let Pill = class Pill extends React.Component {
  static propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.string,
    iconBgColor: PropTypes.string,
    style: PropTypes.object
  };

  render() {
    const {text, icon, iconBgColor} = this.props;

    let iconStyle = styles.pillIcon;
    iconStyle.backgroundColor = iconBgColor || colors.white;

    return (
      <div style={[styles.pill, this.props.style]}>
        {icon && <img src={icon} style={iconStyle} />}
        <div style={styles.pillText}>{text}</div>
      </div>
    );
  }
};
Pill = Radium(Pill);

let SpeechBubble = class SpeechBubble extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    style: PropTypes.object
  };

  render() {
    return (
      <div style={[styles.bubble, this.props.style]}>{this.props.text}</div>
    );
  }
};
SpeechBubble = Radium(SpeechBubble);

const wordChoices = [
  ['Blue', 'Green', 'Red', 'Round', 'Square'],
  [
    'Friendly',
    'Funny',
    'Bizarre',
    'Shy',
    'Glitchy',
    'Delicious',
    'Fun',
    'Angry',
    'Fast',
    'Smart',
    'Brave',
    'Scary',
    'Wild',
    'Fierce',
    'Tropical'
  ]
];

class Words extends React.Component {
  constructor(props) {
    super(props);

    // Randomize word choices and set in state.
    const choices = wordChoices.map(wordSet => {
      return _.shuffle(wordSet);
    });
    this.state = {choices};
  }

  currentItems() {
    const state = getState();
    const itemSet = state.appMode === AppMode.FishShort ? 0 : 1;

    return this.state.choices[itemSet];
  }

  onChangeWord(itemIndex) {
    const word = this.currentItems()[itemIndex];
    setState({
      word,
      trainingQuestion: `Is this fish ${word.toUpperCase()}?`
    });
    toMode(Modes.Training);
  }

  render() {
    const state = getState();
    const currentItems = this.currentItems();
    const buttonStyle =
      state.appMode === AppMode.FishShort
        ? styles.button1col
        : styles.button3col;

    return (
      <Body>
        <Header>Choose Fish Type</Header>
        <Content>
          {state.appMode === AppMode.FishShort && (
            <div style={styles.wordsText}>
              What type of fish do you want to train A.I. to detect?
            </div>
          )}
          {state.appMode === AppMode.FishLong && (
            <div style={styles.wordsText}>
              What happens if the words are more subjective?
              <br />
              Choose a new word to teach A.I.
            </div>
          )}
          {currentItems.map((item, itemIndex) => (
            <Button
              key={itemIndex}
              style={buttonStyle}
              onClick={() => this.onChangeWord(itemIndex)}
            >
              {item}
            </Button>
          ))}
        </Content>
      </Body>
    );
  }
}

let Train = class Train extends React.Component {
  renderSpeechBubble = state => {
    const total = state.yesCount + state.noCount;
    let text = '';

    if (total >= 40) {
      text = "Great work! You can continue when you're ready.";
    } else if (total >= 5) {
      text = 'Keep training!';
    } else if (total === 0 && state.appMode === AppMode.CreaturesVTrash) {
      text = 'Let’s train A.I. again!';
    } else {
      return null;
    }

    return <SpeechBubble text={text} style={{top: '70%', right: '5%'}} />;
  };

  render() {
    const state = getState();
    const trainQuestionTextStyle = state.isRunning
      ? styles.trainQuestionTextDisabled
      : styles.trainQuestionText;
    const yesButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'Yes' : state.word;
    const noButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'No' : `Not ${state.word}`;
    return (
      <Body>
        <Header>A.I. Training</Header>
        <div style={trainQuestionTextStyle}>{state.trainingQuestion}</div>
        <img style={styles.trainBot} src={aiBotClosed} />
        {this.renderSpeechBubble(state)}
        <Pill
          text={state.noCount}
          icon={xIcon}
          iconBgColor={colors.red}
          style={[styles.count, styles.noCount]}
        />
        <Pill
          text={state.yesCount}
          icon={checkmarkIcon}
          iconBgColor={colors.green}
          style={[styles.count, styles.yesCount]}
        />
        <div style={styles.trainButtons}>
          <Button
            style={styles.trainButtonNo}
            onClick={() => onClassifyFish(false)}
          >
            {noButtonText}
          </Button>
          <Button
            style={styles.trainButtonYes}
            onClick={() => onClassifyFish(true)}
          >
            {yesButtonText}
          </Button>
        </div>
        <Button
          style={styles.continueButton}
          onClick={() => toMode(Modes.Predicting)}
        >
          Continue
        </Button>
      </Body>
    );
  }
};
Train = Radium(Train);

class Predict extends React.Component {
  speechBubbleText = state => {
    if (state.isRunning) {
      return null;
    }

    if (state.appMode === AppMode.FishVTrash) {
      return 'Now let’s see if A.I. knows what a fish looks like.';
    } else if (state.appMode === AppMode.CreaturesVTrashDemo) {
      if (state.isPaused) {
        return 'There are lots of creatures in the sea who don’t look like fish. But that doesn’t mean they should be removed! A.I. only knows what we teach it!';
      } else {
        return 'A.I. has learned to remove objects it identifies as  “Not Fish”. What unintended consequences might this lead to?';
      }
    } else if (state.appMode === AppMode.CreaturesVTrash) {
      return 'Now let’s see if A.I. does a better job separating what should be in the ocean and what shouldn’t.';
    } else if (
      state.appMode === AppMode.FishShort ||
      state.appMode === AppMode.FishLong
    ) {
      return `Nice work! Your training data has programmed A.I. to recognize ${state.word.toLowerCase()} fish. Let’s run A.I.’s program and see how it works.`;
    } else {
      return null;
    }
  };

  render() {
    const state = getState();
    const speechBubbleText = this.speechBubbleText(state);

    return (
      <Body>
        <Header>A.I. Sorting</Header>
        {speechBubbleText && (
          <SpeechBubble text={speechBubbleText} style={styles.predictSpeech} />
        )}
        {!state.isRunning && !state.showBiasText && (
          <Button
            style={styles.continueButton}
            onClick={() => setState({isRunning: true, runStartTime: $time()})}
          >
            Run A.I.
          </Button>
        )}
        {(state.isRunning || state.isPaused) && state.canSkipPredict && (
          <Button
            style={styles.continueButton}
            onClick={() => {
              if (state.showBiasText) {
                if (state.onContinue) {
                  state.onContinue();
                }
              } else {
                toMode(Modes.Pond);
              }
            }}
          >
            Continue
          </Button>
        )}
      </Body>
    );
  }
}

class Pond extends React.Component {
  onPondClick(e) {
    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    if (state.pondFishBounds) {
      let fishClicked = false;
      // Look through the array in reverse so that we click on a fish that
      // is rendered topmost.
      _.reverse(state.pondFishBounds).forEach(fishBound => {
        // If we haven't already clicked on a fish in this current iteration,
        // and we're not clicking on a fish that is already actively clicked,
        // and we have a collision, then we have clicked on a new fish!
        if (
          !fishClicked &&
          !(
            state.pondClickedFish &&
            fishBound.fishId === state.pondClickedFish.id
          ) &&
          Collide(
            fishBound.x,
            fishBound.y,
            fishBound.w,
            fishBound.h,
            clickX,
            clickY,
            1,
            1
          )
        ) {
          setState({
            pondClickedFish: {
              id: fishBound.fishId,
              x: fishBound.x,
              y: fishBound.y,
              confidence: fishBound.confidence
            }
          });
          console.log('Fish clicked confidence: ', fishBound.confidence);
          fishClicked = true;
        }
      });

      if (!fishClicked) {
        setState({pondClickedFish: null});
      }
    }
  }

  render() {
    const state = getState();
    let pondText = [];

    if (
      state.appMode === AppMode.FishVTrash ||
      state.appMode === AppMode.CreaturesVTrash
    ) {
      pondText[0] = `Out of ${
        state.fishData.length
      } random objects, A.I. identified ${
        state.totalPondFish
      } that belong in water.`;
    } else {
      pondText[0] = `Out of ${state.fishData.length} objects, I identified ${
        state.totalPondFish
      } that are ${state.word.toUpperCase()}.`;
    }
    pondText[1] = 'How did A.I. do?';
    pondText[2] = 'Choose to Train More or Continue.';

    const showFishDetails = !!state.pondClickedFish;
    let pondFishDetailsStyle;
    let confidence;
    if (showFishDetails) {
      const fish = state.pondClickedFish;

      const leftX = Math.min(
        Math.max(state.pondClickedFish.x + 200, 20),
        constants.canvasWidth - 210
      );
      const topY = Math.min(
        Math.max(state.pondClickedFish.y, 20),
        constants.canvasHeight - 50
      );

      pondFishDetailsStyle = {
        ...styles.pondFishDetails,
        left: leftX,
        top: topY
      };

      if (!fish.confidence || !fish.confidence.confidencesByClassId) {
        confidence = 'Not confident';
      } else if (fish.confidence.confidencesByClassId[0] > 0.99) {
        confidence = 'Very confident';
      } else if (fish.confidence.confidencesByClassId[0] > 0.5) {
        confidence = 'Fairly confident';
      } else {
        confidence = 'Not very confident';
      }
    }

    return (
      <Body onClick={this.onPondClick}>
        <Header>A.I. Results</Header>
        {state.canSeePondText && (
          <div>
            <div style={styles.pondText}>
              {pondText.map((text, index) => {
                return (
                  <div key={index} style={styles.pondTextParagraph}>
                    {text}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <img style={styles.pondBot} src={aiBotClosed} />
        {showFishDetails && (
          <div style={pondFishDetailsStyle}>{confidence}</div>
        )}
        {state.canSkipPond && (
          <div>
            <Button
              style={styles.continueButton}
              onClick={() => {
                if (state.onContinue) {
                  state.onContinue();
                }
              }}
            >
              Continue
            </Button>
            <Button
              style={styles.backButton}
              onClick={() => {
                toMode(Modes.Training);
              }}
            >
              Train More
            </Button>
          </div>
        )}
      </Body>
    );
  }
}

class Guide extends React.Component {
  render() {
    const currentGuide = getCurrentGuide();

    return (
      <div>
        {!!currentGuide && (
          <div
            key={currentGuide.id}
            style={styles.guideBackground}
            onClick={() => dismissGuide(currentGuide.id)}
          >
            <div style={{...styles.guide, ...styles[`guide${currentGuide.style}`]}}>
              <Typist cursor={{show: false}}>{currentGuide.text}</Typist>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default class UI extends React.Component {
  render() {
    const currentMode = getState().currentMode;

    return (
      <div>
        {currentMode === Modes.Instructions && <Instructions />}
        {currentMode === Modes.Words && <Words />}
        {currentMode === Modes.Training && <Train />}
        {currentMode === Modes.Predicting && <Predict />}
        {currentMode === Modes.Pond && <Pond />}
      </div>
    );
  }
}

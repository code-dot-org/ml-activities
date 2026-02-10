import React from 'react';
import _ from 'lodash';
import Radium from 'radium';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBan, faCheck, faInfo} from '@fortawesome/free-solid-svg-icons';

import {getState, setState} from '@ml/oceans/state';
import styles from '@ml/oceans/styles';
import I18n from '@ml/oceans/i18n';
import soundLibrary from '@ml/oceans/models/soundLibrary';
import {arrangeFish} from '@ml/oceans/models/pond';
import helpers, {$time} from '@ml/oceans/helpers';
import guide from '@ml/oceans/models/guide';
import constants, {AppMode, Modes} from '@ml/oceans/constants';
import {Body, Button} from '@ml/oceans/components/common';
import aiBotClosed from '@public/images/ai-bot/ai-bot-closed.png';
import modeHelpers from '@ml/oceans/modeHelpers';
import PondPanel from '@ml/oceans/components/scenes/pond/PondPanel';

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

let UnwrappedPond = class Pond extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = e => {
    // Don't allow keyboard navigation if a Guide is currently showing.
    if (guide.getCurrentGuide()) {
      return;
    }

    const state = getState();
    const fishCollection = state.showRecallFish
      ? state.recallFish
      : state.pondFish;

    if (fishCollection.length === 0) {
      return;
    }

    const currentIndex = state.pondFocusedFishIndex;

    // Handle Escape key to clear selection and exit fish navigation
    if (e.key === 'Escape') {
      e.preventDefault();
      setState({pondClickedFish: null, pondFocusedFishIndex: null});
      soundLibrary.playSound('no');
      return;
    }

    // Handle Enter key to select focused fish
    if (e.key === 'Enter' && currentIndex !== null) {
      e.preventDefault();
      this.selectFishByIndex(currentIndex);
      return;
    }

    // Handle arrow keys for fish navigation
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();

      let newIndex;
      if (currentIndex === null) {
        // If no fish is focused, start at the top-left fish
        newIndex = this.getTopLeftFishIndex(fishCollection);
      } else {
        // Navigate based on key pressed using spatial positions
        if (e.key === 'ArrowRight') {
          newIndex = this.getNextFishInDirection(fishCollection, currentIndex, 'right');
        } else if (e.key === 'ArrowLeft') {
          newIndex = this.getNextFishInDirection(fishCollection, currentIndex, 'left');
        } else if (e.key === 'ArrowDown') {
          newIndex = this.getNextFishInDirection(fishCollection, currentIndex, 'down');
        } else if (e.key === 'ArrowUp') {
          newIndex = this.getNextFishInDirection(fishCollection, currentIndex, 'up');
        }
      }

      setState({pondFocusedFishIndex: newIndex});
    }

    // Handle Tab - exit fish navigation mode and let Tab work normally
    if (e.key === 'Tab' && currentIndex !== null) {
      // Clear fish focus so Tab can move to buttons/other elements
      setState({pondFocusedFishIndex: null});
      // Don't preventDefault - let Tab continue to next focusable element
    }
  };

  getTopLeftFishIndex = fishCollection => {
    // Find the fish with the smallest y, then smallest x (top-left)
    let topLeftIndex = 0;
    let minY = fishCollection[0].getXY().y;
    let minX = fishCollection[0].getXY().x;

    fishCollection.forEach((fish, index) => {
      const xy = fish.getXY();
      if (xy.y < minY || (xy.y === minY && xy.x < minX)) {
        minY = xy.y;
        minX = xy.x;
        topLeftIndex = index;
      }
    });

    return topLeftIndex;
  };

  getNextFishInDirection = (fishCollection, currentIndex, direction) => {
    const currentFish = fishCollection[currentIndex];
    const currentXY = currentFish.getXY();

    let bestIndex = currentIndex;
    let bestDistance = Infinity;

    fishCollection.forEach((fish, index) => {
      if (index === currentIndex) {
        return;
      }

      const xy = fish.getXY();
      const dx = xy.x - currentXY.x;
      const dy = xy.y - currentXY.y;

      let isInDirection = false;
      let primaryDistance = 0;
      let secondaryDistance = 0;

      switch (direction) {
        case 'right':
          // Fish must be to the right (larger x)
          if (dx > 20) {
            isInDirection = true;
            primaryDistance = dx;
            secondaryDistance = Math.abs(dy);
          }
          break;
        case 'left':
          // Fish must be to the left (smaller x)
          if (dx < -20) {
            isInDirection = true;
            primaryDistance = Math.abs(dx);
            secondaryDistance = Math.abs(dy);
          }
          break;
        case 'down':
          // Fish must be below (larger y)
          if (dy > 20) {
            isInDirection = true;
            primaryDistance = dy;
            secondaryDistance = Math.abs(dx);
          }
          break;
        case 'up':
          // Fish must be above (smaller y)
          if (dy < -20) {
            isInDirection = true;
            primaryDistance = Math.abs(dy);
            secondaryDistance = Math.abs(dx);
          }
          break;
      }

      if (isInDirection) {
        // Prefer fish that are closer in the primary direction
        // and have smaller secondary offset (more aligned)
        const distance = primaryDistance + secondaryDistance * 0.5;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    });

    // If no fish found in that direction, wrap around or stay put
    if (bestIndex === currentIndex) {
      // For left/right arrow keys, wrap around to start/end
      if (direction === 'right') {
        return this.getTopLeftFishIndex(fishCollection);
      } else if (direction === 'left') {
        return this.getBottomRightFishIndex(fishCollection);
      }
      // For up/down, stay at current position (no wrap-around)
      return currentIndex;
    }

    return bestIndex;
  };

  getBottomRightFishIndex = fishCollection => {
    // Find the fish with the largest y, then largest x (bottom-right)
    let bottomRightIndex = 0;
    let maxY = fishCollection[0].getXY().y;
    let maxX = fishCollection[0].getXY().x;

    fishCollection.forEach((fish, index) => {
      const xy = fish.getXY();
      if (xy.y > maxY || (xy.y === maxY && xy.x > maxX)) {
        maxY = xy.y;
        maxX = xy.x;
        bottomRightIndex = index;
      }
    });

    return bottomRightIndex;
  };

  selectFishByIndex = index => {
    const state = getState();
    const fishCollection = state.showRecallFish
      ? state.recallFish
      : state.pondFish;

    if (index < 0 || index >= fishCollection.length) {
      return;
    }

    const fish = fishCollection[index];
    const fishBound = state.pondFishBounds.find(fb => fb.fishId === fish.id);

    if (fishBound) {
      setState({
        pondClickedFish: {
          id: fishBound.fishId,
          x: fishBound.x,
          y: fishBound.y
        }
      });
      soundLibrary.playSound('yes');

      if (
        state.appMode === AppMode.FishShort ||
        state.appMode === AppMode.FishLong
      ) {
        setState({
          pondExplainFishSummary: state.trainer.explainFish(fish)
        });
        // Position panel based on fish location
        if (fishBound.x < constants.canvasWidth / 2) {
          setState({pondPanelSide: 'right'});
        } else {
          setState({pondPanelSide: 'left'});
        }
      }
    }
  };

  toggleRecall = e => {
    const state = getState();

    // No-op if transition is already in progress.
    if (state.pondFishTransitionStartTime) {
      return;
    }

    let currentFishSet, nextFishSet;
    if (state.showRecallFish) {
      currentFishSet = state.recallFish;
      nextFishSet = state.pondFish;
      soundLibrary.playSound('yes');
    } else {
      currentFishSet = state.pondFish;
      nextFishSet = state.recallFish;
      soundLibrary.playSound('no');
    }

    // Don't call arrangeFish if fish have already been arranged.
    if (nextFishSet.length > 0 && !nextFishSet[0].getXY()) {
      arrangeFish(nextFishSet);
    }

    if (currentFishSet.length === 0) {
      // Immediately transition to nextFishSet rather than waiting for empty animation.
      setState({showRecallFish: !state.showRecallFish, pondClickedFish: null, pondFocusedFishIndex: null});
    } else {
      setState({pondFishTransitionStartTime: $time(), pondClickedFish: null, pondFocusedFishIndex: null});
    }

    if (e) {
      e.stopPropagation();
    }
  };

  onPondClick = e => {
    // Don't allow pond clicks if a Guide is currently showing.
    if (guide.getCurrentGuide()) {
      return;
    }

    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    const boundingRect = e.target.getBoundingClientRect();
    const pondWidth = boundingRect.width;
    const pondHeight = boundingRect.height;

    // Scale the click to the pond canvas dimensions.
    const normalizedClickX = (clickX / pondWidth) * constants.canvasWidth;
    const normalizedClickY = (clickY / pondHeight) * constants.canvasHeight;

    const fishCollection = state.showRecallFish
      ? state.recallFish
      : state.pondFish;

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
            normalizedClickX,
            normalizedClickY,
            1,
            1
          )
        ) {
          setState({
            pondClickedFish: {
              id: fishBound.fishId,
              x: fishBound.x,
              y: fishBound.y
            }
          });
          fishClicked = true;
          soundLibrary.playSound('yes');

          if (
            state.appMode === AppMode.FishShort ||
            state.appMode === AppMode.FishLong
          ) {
            const clickedFish = fishCollection.find(
              f => f.id === fishBound.fishId
            );
            setState({
              pondExplainFishSummary: state.trainer.explainFish(clickedFish)
            });
            if (normalizedClickX < constants.canvasWidth / 2) {
              setState({pondPanelSide: 'right'});
            } else {
              setState({pondPanelSide: 'left'});
            }
          }
        }
      });

      if (!fishClicked) {
        setState({pondClickedFish: null, pondFocusedFishIndex: null});
        soundLibrary.playSound('no');
      } else {
        // Sync focused index with clicked fish
        const clickedFishIndex = fishCollection.findIndex(
          f => f.id === state.pondClickedFish.id
        );
        if (clickedFishIndex !== -1) {
          setState({pondFocusedFishIndex: clickedFishIndex});
        }
      }
    }
  };

  onPondPanelButtonClick = e => {
    const state = getState();

    if ([AppMode.FishShort, AppMode.FishLong].includes(state.appMode)) {
      setState({
        pondPanelShowing: !state.pondPanelShowing
      });

      if (state.pondPanelShowing) {
        soundLibrary.playSound('sortno');
      } else {
        soundLibrary.playSound('sortyes');
      }
    }

    if (e) {
      e.stopPropagation();
    }
  };

  render() {
    const state = getState();

    const showInfoButton =
      [AppMode.FishShort, AppMode.FishLong].includes(state.appMode) &&
      state.pondFish.length > 0 &&
      state.recallFish.length > 0;
    const recallIconsStyle = showInfoButton
      ? styles.recallIcons
      : {...styles.recallIcons, right: '1.2%'};

    return (
      <Body>
        <div
          onClick={this.onPondClick}
          style={styles.pondSurface}
          tabIndex={0}
          aria-label="Pond with fish - use arrow keys to navigate, Enter to select, Escape to deselect, Tab to navigate to buttons"
        />
        <div style={recallIconsStyle}>
          <button
            type="button"
            onClick={this.toggleRecall}
            aria-label={I18n.t('switchToMatchingItems')}
            style={{
              ...styles.recallIcon,
              ...{borderTopLeftRadius: 8, borderBottomLeftRadius: 8},
              ...(state.showRecallFish ? {} : styles.bgGreen)
            }}
          >
            <FontAwesomeIcon
              icon={faCheck}
              style={{width: '100%', height: '100%'}}
            />
          </button>
          <button
            type="button"
            onClick={this.toggleRecall}
            aria-label={I18n.t('switchToNonMatchingItems')}
            style={{
              ...styles.recallIcon,
              ...{borderTopRightRadius: 8, borderBottomRightRadius: 8},
              ...(state.showRecallFish ? styles.bgRed : {})
            }}
          >
            <FontAwesomeIcon
              icon={faBan}
              style={{width: '100%', height: '100%'}}
            />
          </button>
        </div>
        {showInfoButton && (
          <div
            style={{
              ...styles.infoIconContainer,
              ...(!state.pondPanelShowing ? {} : styles.bgTeal)
            }}
            onClick={this.onPondPanelButtonClick}
            id="uitest-info-btn"
          >
            <FontAwesomeIcon icon={faInfo} style={styles.infoIcon} />
          </div>
        )}
        <img style={styles.pondBot} src={aiBotClosed} alt="" />
        {state.canSkipPond && (
          <div id="uitest-nav-btns">
            {state.appMode === AppMode.FishLong ? (
              <div>
                <Button
                  style={styles.playAgainButton}
                  onClick={() => {
                    setState({pondClickedFish: null, pondFocusedFishIndex: null, pondPanelShowing: false});
                    helpers.resetTraining(state);
                    modeHelpers.toMode(Modes.Words);
                  }}
                >
                  {I18n.t('newWord')}
                </Button>
                <Button style={styles.finishButton} onClick={state.onContinue}>
                  {I18n.t('finish')}
                </Button>
              </div>
            ) : (
              <Button style={styles.continueButton} onClick={state.onContinue}>
                {I18n.t('continue')}
              </Button>
            )}
            <div>
              <Button
                style={styles.backButton}
                onClick={() => {
                  modeHelpers.toMode(Modes.Training);
                  setState({pondClickedFish: null, pondFocusedFishIndex: null, pondPanelShowing: false});
                }}
              >
                {I18n.t('trainMore')}
              </Button>
            </div>
          </div>
        )}
        {state.pondPanelShowing && <PondPanel />}
      </Body>
    );
  }
};
export default Radium(UnwrappedPond);

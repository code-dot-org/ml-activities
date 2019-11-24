import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';
import {queryStrFor} from '../helpers';
import turtleImage from '../../../public/images/seaCreatures/Turtle.png';
import seahorseImage from '../../../public/images/seaCreatures/Seahorse.png';
import trashBottleImage from '../../../public/images/trash/Trash_Bottle.png';
import trashCanImage from '../../../public/images/trash/Trash_Can.png';

const guides = [
  {
    id: 'fishvtrash-training-init1',
    text: `Garbage dumped in the water affects marine life.  In this activity you will "program" or "train" A.I. (artificial intelligence) to identify fish or trash.  Let's clean up the ocean!`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
  },
  {
    id: 'fishvtrash-training-init2',
    text: `Let's meet A.I.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    arrow: 'BotRight'
  },
  {
    id: 'fishvtrash-training-init3',
    text: `A.I. does not know if an object is a fish or trash, but it can process images and identify patterns.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training}
  },
  {
    id: 'fishvtrash-training-init4',
    text: `To program A.I., use the buttons to label an image as "Fish" or "Not Fish".  This will teach A.I. to recognize patterns on its own.  Let's get started!`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'Center',
    arrow: 'LowerCenter'
  },
  {
    id: 'fishvtrash-training-pause1',
    heading: 'Did you know?',
    text: `17 billion pounds of plastic enters the ocean each year.`,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'Info',
    image: trashBottleImage
  },
  {
    id: 'fishvtrash-training-pause2',
    text: `You are programming or “training” A.I. with each click. Keep going. `,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    }
  },
  {
    id: 'fishvtrash-training-pause3',
    heading: 'Did you know?',
    text: `80% of ocean pollution comes from land debris, and is estimated to cost $13 billion per year.`,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    style: 'Info',
    image: trashCanImage
  },
  {
    id: 'fishvtrash-training-pause4',
    text: `A.I. learns from your choices. If you make “wrong” choices, A.I. will learn to repeat your mistakes.`,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    }
  },
  {
    id: 'fishvtrash-training-pause5',
    text: `Great work!  The more data you provide A.I. the more it learns.  Keep training A.I. or continue when ready.`,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'fishvtrash-predicting-init1',
    text: `Now let's see if A.I. knows what a "Fish" looks like.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init2',
    text: `A.I. will analyze 100 objects and label them based on your training.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init3',
    text: `Let's go!`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'fishvtrash-pond-init1',
    text: `Based on your training here are the objectes that A.I. identified as "Fish".  How did A.I. do?`,
    //TODO after doing a 2nd training iteration these messages no longer show
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  //TODO consider not shwoing the train more and continue guide until the buttons are present on the screen
  {
    id: 'fishvtrash-pond-init2',
    text: `You can train A.I. more...`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerLeft'
  },
  {
    id: 'fishvtrash-pond-init3',
    text: `...or Continue.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrash-predicting-init1',
    text: `So far we trained A.I. to identify objects as either "Fish" or "Not Fish".`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrash-predicting-init2',
    text: `What if this training data was used to decide what belonged in the water?`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
  },
  {
    id: 'creaturesvtrash-predicting-init3',
    text: `What would happen to other sea creatures?  Does our training approach cause unintended consequences?`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
  },
  {
    id: 'creaturesvtrash-predicting-init4',
    text: `Let's see.`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause1',
    text: `Did you notice that some sea creatures were unintentionally identified as "Not Fish"?`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause2',
    text: `Many sea creatures don't look like fish.  That doesn’t mean they don't belong in the water.`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrash-predicting-pause3',
    text: `A.I. only learns what we teach it.`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrash-predicting-pause4',
    text: `Let's train A.I. again.`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    },
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrash-training-init1',
    text: `Let’s teach A.I. to learn which objects should be in the water.`,
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Training}
  },
  {
    id: 'creaturesvtrash-training-init2',
    heading: 'Did you know?',
    text: `In the ocean, plastic debris can harm fish, seabirds and marine mammals. This is one of many reasons to keep the oceans clean.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'Info',
    image: seahorseImage
  },
  {
    id: 'creaturesvtrash-training-init3',
    text: `The more training data you provide, the more A.I. learns.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    }
  },
  {
    id: 'creaturesvtrash-training-init4',
    heading: 'Did you know?',
    text: `Marine plastic pollution has impacted at least 267 species worldwide, including 86% of all sea turtle species.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    style: 'Info',
    image: turtleImage
  },
  {
    id: 'creaturesvtrash-training-init5',
    text: `Keep training to teach A.I. what belongs in the water.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    }
  },
  {
    id: 'creaturesvtrash-training-init6',
    text: `Great work!  The more data you provide A.I. the better it will do.  Keep training A.I. or continue when ready.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'creaturesvtrash-predicting-init1',
    text: `Do you think A.I. will now do a better job identifying what should be in the water?  Let's watch.`,
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrash-pond-init1',
    text: `Based on your training here are the objectes that A.I. identified as "Belongs in water".  How did A.I. do?`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  {
    id: 'fishshort-words-init1',
    text: 'AI and machine learning can be used to teach a computer new patterns.',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-words-init2',
    text:
      "Let’s teach A.I. a new word by showing it examples of that type of fish.",
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-predicting-init1',
    textFn: state => {
      return `With your training data, you have programmed A.I. to recognize '${state.word.toUpperCase()}' fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify '${state.word.toUpperCase()}' fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-pond-init1',
    textFn: state => {
      return `Based on your training A.I. identified ${
        state.fishData.length === 1 ? 'this' : 'these'
      } fish as '${state.word.toUpperCase()}'. How did A.I do?`;
    },
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  {
    id: 'fishlong-words-init1',
    text: 'Now let’s see if A.I. can learn a less obvious word.',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words}
  },
  {
    id: 'fishlong-words-init2',
    text: 'Let’s teach A.I. a word that depends on your opinion.  It’s up to you to pick fish that match your word.',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words}
  },
  {
    id: 'fishlong-predicting-init1',
    textFn: state => {
      return `With your training data, you have programmed A.I. to recognize '${state.word.toUpperCase()}' fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify '${state.word.toUpperCase()}' fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-pond-init1',
    textFn: state => {
      return `Based on your training A.I. identified ${
        state.fishData.length === 1 ? 'this' : 'these'
      } fish as '${state.word.toUpperCase()}'. How did A.I do?`;
    },
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  //TODO add guides to introduce the pond info and AI results functionality
  {
    id: 'fishlong-pond-init2',
    text: 'Try out a new word by clicking New Word.',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    arrow: 'LowishRight'
  }
];

export function getCurrentGuide() {
  if (queryStrFor('guide') === 'off') {
    return null;
  }

  const state = getState();

  for (const guide of guides) {
    // If the current state matches the guide's requirements...
    if (
      Object.keys(guide.when).every(key => {
        return key === 'fn'
          ? guide.when['fn'](getState())
          : guide.when[key] === state[key];
      })
    ) {
      // And if we haven't already dismissed this particular guide...
      if (
        !(state.guideDismissals && state.guideDismissals.includes(guide.id))
      ) {
        return guide;
      }
    }
  }

  return null;
}

export function dismissCurrentGuide() {
  const currentGuide = getCurrentGuide();

  // If we have a current guide, and it's actually showing (rather than still
  // typing).
  if (currentGuide && getState().guideShowing) {
    const state = getState();
    const currentGuideDismissals = state.guideDismissals;
    let newGuideDismissals = [...currentGuideDismissals];
    newGuideDismissals.push(currentGuide.id);
    setState({guideDismissals: newGuideDismissals, guideShowing: false});

    return true;
  }

  return false;
}

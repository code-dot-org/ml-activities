import {
  FishOceanObject,
  SeaCreatureOceanObject,
  TrashOceanObject
} from '../oceans/OceanObject';
import {getState} from '../oceans/state';
import {fishData} from './fishData';
import {filterFishComponents, generateColorPalette} from '../oceans/helpers';
import _ from 'lodash';

/*
 * Generates a set of ocean objects of size numFish.
 * This function ensures an even number of bodies, eyes, mouths,
 * and color palettes over the set of FishOceanObjects.
 * If stateloadTrashImages is true it will make half of the objects
 * TrashOceanObjects.
 */
export const generateOcean = (
  numFish,
  idStart = 0,
  loadFish = true,
  loadTrashImages,
  loadCreatureImages
) => {
  const state = getState();
  let ocean = [];
  let possibleObjects = [];
  if (loadFish) {
    possibleObjects.push(FishOceanObject);
  }
  if (
    (loadTrashImages !== undefined && loadTrashImages) ||
    (loadTrashImages === undefined && state.loadTrashImages)
  ) {
    possibleObjects.push(TrashOceanObject);
  }
  if (
    (loadCreatureImages !== undefined && loadCreatureImages) ||
    (loadCreatureImages === undefined && state.loadCreatureImages)
  ) {
    possibleObjects.push(SeaCreatureOceanObject);
  }

  const possibleFishComponents = filterFishComponents(
    fishData,
    getState().appMode
  );
  let bodies = _.shuffle(Object.values(possibleFishComponents.bodies));
  let eyes = _.shuffle(Object.values(possibleFishComponents.eyes));
  let mouths = _.shuffle(Object.values(possibleFishComponents.mouths));
  let colors = _.shuffle(Object.values(possibleFishComponents.colors));

  for (var i = idStart; i < numFish + idStart; ++i) {
    const object = new possibleObjects[i % possibleObjects.length](
      i,
      possibleFishComponents
    );
    if (object instanceof FishOceanObject) {
      // For each of these components, use the next variation on the list
      // Reshuffle the list if we've reached the end to avoid any regularity.
      object.body = bodies[i % bodies.length];
      object.eye = eyes[i % eyes.length];
      object.mouth = mouths[i % mouths.length];
      const bodyIdx = i % colors.length;
      object.colorPalette = generateColorPalette(colors, bodyIdx);
    }

    if (i % bodies.length === bodies.length - 1) {
      bodies = _.shuffle(bodies);
    }
    if (i % eyes.length === eyes.length - 1) {
      eyes = _.shuffle(eyes);
    }
    if (i % mouths.length === mouths.length - 1) {
      mouths = _.shuffle(mouths);
    }
    if (i % colors.length === colors.length - 1) {
      colors = _.shuffle(colors);
    }

    object.randomize();
    ocean.push(object);
  }
  ocean = _.shuffle(ocean);
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    if (!fish.getResult()) {
      predictionPromises.push(
        trainer.predict(fish).then(res => {
          fish.setResult(res);
        })
      );
    }
  });
  await Promise.all(predictionPromises);
  return ocean;
};

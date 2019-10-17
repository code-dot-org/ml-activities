import fish from './fishData';
const _ = require('lodash');

const getAllComponents = () => {
  let allComponents = [];
  Object.values(fish).forEach(compClass => {
    Object.values(compClass).forEach(comp => {
      allComponents.push(comp);
    });
  });
  return allComponents;
};

const allComponents = getAllComponents();

export const generateRandomFish = (trait = "") => {
  const traitComp = _.shuffle(allComponents).find(comp =>
    _.includes(comp.traits, trait)
  );
  const bodies = Object.values(fish.bodies);
  const eyes = Object.values(fish.eyes);
  const mouths = Object.values(fish.mouths);
  const sideFinsFront = Object.values(fish.pectoralFinsFront);
  const sideFinsBack = Object.values(fish.pectoralFinsBack);
  const topFins = Object.values(fish.topFins);
  const tails = Object.values(fish.tails);
  const colorPalettes = Object.values(fish.colorPalettes);

  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const eye = eyes[Math.floor(Math.random() * eyes.length)];
  const mouth = mouths[Math.floor(Math.random() * mouths.length)];
  const finIdx = Math.floor(Math.random() * sideFinsFront.length);
  const sideFinFront = sideFinsFront[finIdx];
  const sideFinBack = sideFinsBack[finIdx];
  const topFin = topFins[Math.floor(Math.random() * topFins.length)];
  const tail = tails[Math.floor(Math.random() * tails.length)];
  const colorPalette =
    colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  let parts = [body, eye, mouth, sideFinFront, sideFinBack, topFin, tail];
  let knnData = [];
  parts.forEach((part, idx) => {
    if (traitComp && part.type === traitComp.type) {
      parts[idx] = traitComp;
    }
    knnData = knnData.concat(part.knnData);
  });
  knnData = knnData.concat(colorPalette.knnData);
  return {
    parts,
    colorPalette,
    knnData
  };
};

export const generateOcean = (numFish, traitProportions = {}) => {
  const ocean = [];
  Object.keys(traitProportions).forEach(trait => {
    const proportion = traitProportions[trait];
    for (var i = 0; i < Math.round(proportion * numFish); ++ i) {
    ocean.push(generateRandomFish(trait));
    }
  });
  const numFishToFill = numFish - ocean.length;
  for (var i = 0; i < numFishToFill; ++i) {
    ocean.push(generateRandomFish());
  }
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    predictionPromises.push(
      trainer.predictFromData(fish.knnData).then(res => {
        fish.result = res;
      })
    );
  });
  await Promise.all(predictionPromises);
  return ocean;
};

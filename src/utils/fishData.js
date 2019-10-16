import {PropTypes} from 'react';

const normalizeColorComponent = colorcomp => {
  return colorcomp / 255;
};

// Describe the different body parts of the fish. The object
// is ordered by its render dependency (i.e., dorsalFin should be rendered
// before body).
export const FishBodyPart = Object.freeze({
  DORSAL_FIN: 6,
  TAIL: 1,
  BODY: 2,
  MOUTH: 3,
  EYE: 4,
  PECTORAL_FIN: 5
});

const fish = {
  // BODY KNN DATA: [height:width ratio]
  bodies: {
    body1: {
      src: 'images/fish/body/brendan1.png',
      anchor: [90, 65],
      eyeAnchor: [52, 17],
      mouthAnchor: [80, 15],
      pectoralFinAnchor: [40, 65],
      dorsalFinAnchor: [30, -45],
      tailAnchor: [-25, 20],
      knnData: [0],
      type: FishBodyPart.BODY
    },
    body2: {
      src: 'images/fish/body/brendan2.png',
      anchor: [90, 65],
      eyeAnchor: [52, 17],
      mouthAnchor: [80, 15],
      pectoralFinAnchor: [40, 65],
      dorsalFinAnchor: [30, -45],
      tailAnchor: [-25, 20],
      knnData: [0],
      type: FishBodyPart.BODY
    },
    body3: {
      src: 'images/fish/body/brendan3.png',
      anchor: [90, 65],
      eyeAnchor: [52, 17],
      mouthAnchor: [80, 15],
      pectoralFinAnchor: [40, 65],
      dorsalFinAnchor: [30, -45],
      tailAnchor: [-25, 20],
      knnData: [0],
      type: FishBodyPart.BODY
    }
  },
  // EYE KNN DATA: [eye area, pupil:eye area ratio]
  eyes: {
    eye1: {
      src: 'images/fish/eyes/brendan1.png',
      knnData: [0],
      type: FishBodyPart.EYE
    },
    eye2: {
      src: 'images/fish/eyes/brendan2.png',
      knnData: [0],
      type: FishBodyPart.EYE
    },
    eye3: {
      src: 'images/fish/eyes/brendan3.png',
      knnData: [0],
      type: FishBodyPart.EYE
    },
    eye4: {
      src: 'images/fish/eyes/brendan4.png',
      knnData: [0],
      type: FishBodyPart.EYE
    }
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool), ratio of height:wifth]
  mouths: {
    mouth1: {
      src: 'images/fish/mouth/brendan1.png',
      knnData: [1],
      type: FishBodyPart.MOUTH
    },
    mouth2: {
      src: 'images/fish/mouth/brendan2.png',
      knnData: [1],
      type: FishBodyPart.MOUTH
    }
  },
  // SIDE FIN KNN DATA: [pointiness rank]
  sideFins: {
    sideFin1: {
      src: 'images/fish/pectoralFin/brendan1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin2: {
      src: 'images/fish/pectoralFin/brendan2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN
    }
  },
  // TOP FIN KNN DATA: [pointiness rank]
  topFins: {
    topFin1: {
      src: 'images/fish/dorsalFin/brendan1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin2: {
      src: 'images/fish/dorsalFin/brendan2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin3: {
      src: 'images/fish/dorsalFin/brendan3.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin4: {
      src: 'images/fish/dorsalFin/brendan4.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
  },
  // TAIL KNN DATA: [sections, width]
  tails: {
    tail1: {
      src: 'images/fish/tailFin/brendan1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    tail2: {
      src: 'images/fish/tailFin/brendan2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    }
  },
  // COLOR PALETTE KNN DATA: [...bodyRgb, ...finRgb]
  colorPalettes: {
    palette1: {
      bodyRgb: [126, 205, 202],
      finRgb: [248, 192, 157],
      mouthRgb: [221, 148, 193],
      knnData: [
        normalizeColorComponent(126),
        normalizeColorComponent(205),
        normalizeColorComponent(202),
        normalizeColorComponent(248),
        normalizeColorComponent(192),
        normalizeColorComponent(157)
      ]
    },
    palette2: {
      bodyRgb: [253, 192, 77],
      finRgb: [235, 120, 50],
      mouthRgb: [235, 120, 50],
      knnData: [
        normalizeColorComponent(253),
        normalizeColorComponent(192),
        normalizeColorComponent(77),
        normalizeColorComponent(235),
        normalizeColorComponent(120),
        normalizeColorComponent(50)
      ]
    },
    palette3: {
      bodyRgb: [39, 116, 186],
      finRgb: [253, 217, 136],
      mouthRgb: [253, 217, 136],
      knnData: [
        normalizeColorComponent(39),
        normalizeColorComponent(116),
        normalizeColorComponent(186),
        normalizeColorComponent(253),
        normalizeColorComponent(217),
        normalizeColorComponent(136)
      ]
    },
    palette4: {
      bodyRgb: [21, 52, 64],
      finRgb: [200, 220, 92],
      mouthRgb: [200, 220, 92],
      knnData: [
        normalizeColorComponent(21),
        normalizeColorComponent(52),
        normalizeColorComponent(64),
        normalizeColorComponent(200),
        normalizeColorComponent(220),
        normalizeColorComponent(92)
      ]
    }
  }
};

export default fish;

export const bodyShape = PropTypes.shape({
  src: PropTypes.string.isRequired,
  anchor: PropTypes.array.isRequired,
  eyeAnchor: PropTypes.array.isRequired,
  mouthAnchor: PropTypes.array.isRequired,
  sideFinAnchor: PropTypes.array.isRequired,
  topFinAnchor: PropTypes.array.isRequired,
  tailAnchor: PropTypes.array.isRequired,
  knnData: PropTypes.array.isRequired
});

export const bodyPartShape = PropTypes.shape({
  src: PropTypes.string.isRequired,
  knnData: PropTypes.array.isRequired
});

export const colorPaletteShape = PropTypes.shape({
  bodyColor: PropTypes.string.isRequired,
  finColor: PropTypes.string.isRequired,
  mouthColor: PropTypes.string.isRequired,
  knnData: PropTypes.array.isRequired
});

export const fishShape = PropTypes.shape({
  body: bodyShape.isRequired,
  eye: bodyPartShape.isRequired,
  mouth: bodyPartShape.isRequired,
  sideFin: bodyPartShape.isRequired,
  topFin: bodyPartShape.isRequired,
  tail: bodyPartShape.isRequired,
  colorPalette: colorPaletteShape.isRequired,
  canvasId: PropTypes.string.isRequired
});

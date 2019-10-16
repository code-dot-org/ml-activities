import {PropTypes} from 'react';

const normalizeColorComponent = colorcomp => {
  return colorcomp / 255;
};

// Describe the different body parts of the fish. The object
// is ordered by its render dependency (i.e., dorsalFin should be rendered
// before body).
export const FishBodyPart = Object.freeze({
  DORSAL_FIN: 0,
  TAIL: 1,
  PECTORAL_FIN_BACK: 2,
  BODY: 3,
  MOUTH: 4,
  EYE: 5,
  PECTORAL_FIN: 6,
  PECTORAL_FIN_FRONT: 7
});

const fish = {
  // BODY KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  bodies: {
    body1: {
      src: 'images/fish/bethanyfish/Body_RoundedSquare.png',
      anchor: [50, 25],
      eyeAnchor: [89, 10],
      mouthAnchor: [89, 42],
      pectoralFinAnchor: [40, 65],
      frontPectoralFinAnchor: [8, 79.4],
      backPectoralFinAnchor: [46, 81.4],
      dorsalFinAnchor: [3, -21.6],
      tailAnchor: [6, 45],
      knnData: [0.82],
      type: FishBodyPart.BODY
    },
    body2: {
      src: 'images/fish/body/Body_BrushTip.png',
      anchor: [50, 30],
      eyeAnchor: [96, 6],
      mouthAnchor: [110, 32],
      frontPectoralFinAnchor: [16, 70],
      backPectoralFinAnchor: [49, 77],
      dorsalFinAnchor: [20, -18],
      tailAnchor: [6, 41],
      knnData: [0.37],
      type: FishBodyPart.BODY
    },
    body3: {
      src: 'images/fish/body/Body_Round.png',
      anchor: [50, 30],
      eyeAnchor: [85, 20],
      mouthAnchor: [92, 44],
      frontPectoralFinAnchor: [9, 88],
      backPectoralFinAnchor: [38, 90],
      dorsalFinAnchor: [7, -18],
      tailAnchor: [6, 50],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    body4: {
      src: 'images/fish/body/Body_Shark.png',
      anchor: [50, 30],
      eyeAnchor: [143, 8],
      mouthAnchor: [138, 34],
      frontPectoralFinAnchor: [39, 68],
      backPectoralFinAnchor: [68, 70],
      dorsalFinAnchor: [47, -18],
      tailAnchor: [18, 21],
      knnData: [0.003],
      type: FishBodyPart.BODY
    }
  },
  // EYE KNN DATA: [width (in pixels), height (in pixels)]
  eyes: {
    eye1: {
      src: 'images/fish/bethanyfish/SideEyes.png',
      knnData: [7, 7],
      type: FishBodyPart.EYE
    },
    eye2: {
      src: 'images/fish/bethanyfish/AngryEyes.png',
      knnData: [9, 8],
      type: FishBodyPart.EYE
    },
    eye3: {
      src: 'images/fish/bethanyfish/ConcentricEyes.png',
      knnData: [9, 8],
      type: FishBodyPart.EYE
    },
    eye4: {
      src: 'images/fish/bethanyfish/BigEyes.png',
      knnData: [9, 8],
      type: FishBodyPart.EYE
    }
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool)]
  mouths: {
    mouth1: {
      src: 'images/fish/bethanyfish/LongMouth.png',
      knnData: [1],
      type: FishBodyPart.MOUTH
    },
    mouth3: {
      src: 'images/fish/mouth/Mouth_Heart.png',
      knnData: [0],
      type: FishBodyPart.MOUTH
    },
    mouth4: {
      src: 'images/fish/mouth/Mouth_DuckLips.png',
      knnData: [0],
      type: FishBodyPart.MOUTH
    },
    mouth5: {
      src: 'images/fish/bethanyfish/Mouth_Shark.png',
      knnData: [0],
      type: FishBodyPart.MOUTH
    },
    mouth6: {
      src: 'images/fish/bethanyfish/Mouth_SharpTeeth.png',
      knnData: [0],
      type: FishBodyPart.MOUTH
    },
    mouth7: {
      src: 'images/fish/bethanyfish/Lips.png',
      knnData: [0],
      type: FishBodyPart.MOUTH
    }
  },
  sideFinsFront: {
    sideFin1: {
      src:
        'images/fish/bethanyfish/Pectoral_Fin_RoundTriangle_front_bethany.png',
      knnData: [17, 18, 0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    sideFin2: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    sideFin3: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Almond.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    sideFin5: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_RoundTriangle.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    sideFin6: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    }
  },
  // SIDE FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  sideFinsBack: {
    sideFin1: {
      src:
        'images/fish/bethanyfish/Pectoral_Fin_RoundTriangle_front_bethany.png',
      knnData: [17, 18, 0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    sideFin2: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    sideFin3: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Almond.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    sideFin5: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_RoundTriangle.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    sideFin6: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN_BACK
    }
  },
  // TOP FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  topFins: {
    topFin1: {
      src: 'images/fish/bethanyfish/Dorsal_Fin_Wave_bethany.png',
      knnData: [16, 15, 0],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin2: {
      src: 'images/fish/bethanyfish/anglerfish.png',
      knnData: [16, 15, 0],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin3: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Mohawk.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin4: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Almond.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin6: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Shark.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    }
  },
  // TAIL KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  tails: {
    tail1: {
      src: 'images/fish/bethanyfish/Tail_Fin_RoundedHeart_bethany.png',
      knnData: [14, 30, 0],
      type: FishBodyPart.TAIL
    },
    tail3: {
      src: 'images/fish/tailFin/Tail_Fin_Almond.png',
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    },
    tail4: {
      src: 'images/fish/tailFin/Tail_Fin_Bean.png',
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    },
    tail5: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedTriangle.png',
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    },
    tail6: {
      src: 'images/fish/tailFin/Tail_Fin_Sharp.png',
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    }
  },
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
    },
    palette5: {
      bodyRgb: [170, 191, 208],
      finRgb: [201, 219, 83],
      mouthRgb: [200, 220, 92],
      // TODO: fix this KNN data
      knnData: [
        normalizeColorComponent(170),
        normalizeColorComponent(191),
        normalizeColorComponent(208),
        normalizeColorComponent(201),
        normalizeColorComponent(219),
        normalizeColorComponent(83)
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

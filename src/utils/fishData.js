import {PropTypes} from 'react';

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
      anchor: [25, 25],
      eyeAnchor: [89, 10],
      mouthAnchor: [89, 42],
      pectoralFinAnchor: [40, 65],
      frontPectoralFinAnchor: [8, 79.4],
      backPectoralFinAnchor: [46, 81.4],
      dorsalFinAnchor: [3, -21.6],
      tailAnchor: [-25, 20],
      knnData: [32, 32, 0],
      type: FishBodyPart.BODY
    },
    body2: {
      src: 'images/fish/body/Body_BrushTip.png',
      anchor: [40, 30],
      eyeAnchor: [96, 6],
      mouthAnchor: [110, 32],
      frontPectoralFinAnchor: [16, 70],
      backPectoralFinAnchor: [49, 77],
      dorsalFinAnchor: [3, -18],
      tailAnchor: [-27, 14],
      knnData: [48, 27, 0],
      type: FishBodyPart.BODY
    },
    body3: {
      src: 'images/fish/body/Body_Round.png',
      anchor: [40, 30],
      eyeAnchor: [85, 20],
      mouthAnchor: [92, 44],
      frontPectoralFinAnchor: [9, 88],
      backPectoralFinAnchor: [38, 90],
      dorsalFinAnchor: [7, -18],
      tailAnchor: [-25, 20],
      knnData: [48, 27, 0],
      type: FishBodyPart.BODY
    },
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
    }

  },
  sideFinsFront: {
    sideFin1: {
      src: 'images/fish/bethanyfish/Pectoral_Fin_RoundTriangle_front_bethany.png',
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
      src: 'images/fish/bethanyfish/Pectoral_Fin_RoundTriangle_front_bethany.png',
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
    // This fin needs to be on the body as opposed to coming off the body so it will
    // need different anchor points on the body itself.
    /*
    sideFin4: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Bean.png',
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN
    },*/
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
    },/*
    topFin2: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Mohawk.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin3: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Almond.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    // This fin spans the whole body so can only be used with the corresponding side fin
    // topFin4: {
    //   src: 'images/fish/dorsalFin/Dorsal_Fin_Bean.png',
    //   knnData: [20, 26, 1],
    //   type: FishBodyPart.DORSAL_FIN
    // },
    topFin5: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Wave.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin6: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Shark.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    }*/
  },
  // TAIL KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  tails: {
    tail1: {
      src: 'images/fish/bethanyfish/Tail_Fin_RoundedHeart_bethany.png',
      knnData: [14, 30, 0],
      type: FishBodyPart.TAIL
    },/*
    tail2: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedHeart.png',
      knnData: [14, 28, 1],
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
    }*/
  },
  colorPalettes: {
    palette1: {
      bodyRgb: [126, 205, 202],
      finRgb: [248, 192, 157],
      mouthRgb: [221, 148, 193],
      knnData: [234, 103, 108, 20, 52, 65]
    },
    palette2: {
      bodyRgb: [253, 192, 77],
      finRgb: [235, 120, 50],
      mouthRgb: [235, 120, 50],
      // TODO: fix this KNN data
      knnData: [234, 103, 108, 20, 52, 65]
    },
    palette3: {
      bodyRgb: [39, 116, 186],
      finRgb: [253, 217, 136],
      mouthRgb: [253, 217, 136],
      // TODO: fix this KNN data
      knnData: [234, 103, 108, 20, 52, 65]
    },
    palette4: {
      bodyRgb: [21, 52, 64],
      finRgb: [200, 220, 92],
      mouthRgb: [200, 220, 92],
      // TODO: fix this KNN data
      knnData: [234, 103, 108, 20, 52, 65]
    },
    palette5: {
      bodyRgb: [170, 191, 208],
      finRgb: [201, 219, 83],
      mouthRgb: [200, 220, 92],
      // TODO: fix this KNN data
      knnData: [234, 103, 108, 20, 52, 65]
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

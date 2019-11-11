import 'idempotent-babel-polyfill';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import constants from '../demo/constants';

let mobilenet;

export const initMobilenet = async () => {
  mobilenet = mobilenetModule.load(1, 0.25).then(res => (mobilenet = res));
};

onmessage = event => {
  mobilenetModule.load(1, 0.25).then(mobilenet => {
    const imageData = new ImageData(event.data, constants.fishCanvasWidth);
    const image = tf.fromPixels(imageData);
    const infer = () => mobilenet.infer(image, 'conv_preds');
    const logits = infer();
    postMessage(logits);
  });
};

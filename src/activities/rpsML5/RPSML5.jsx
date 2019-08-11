/**
 * RPS Activity. Based off of:
 * - https://editor.p5js.org/ml5/sketches/S3JfKStZ8I
 * - https://github.com/ryansloan/rps-ml
 * - https://github.com/googlecreativelab/teachable-machine-boilerplate
 */

import * as ml5 from "ml5";
import React from 'react';

// Number of classes to classify
const NUM_CLASSES = 3;
// Webcam Image size. Must be 227.
const IMAGE_SIZE = 224;
const CLASS_NAMES = ['rock', 'paper', 'scissors'];
let example_counts = [0, 0, 0];
const MIN_EXAMPLES = 20;

const NO_CLASS = -1;

module.exports = class Main extends React.Component {
  constructor(props) {
    super(props);
    this.video = null;
  }

  state = {
    predictedClass: NO_CLASS,
    infoText0: "",
    infoText1: "",
    infoText2: "",
    trainingImages0: [],
    trainingImages1: [],
    trainingImages2: [],
  };

  componentDidMount() {
    this.training = NO_CLASS;
    this.videoPlaying = false;

    this.initializeClassifiers();
    this.initializeWebcamVideo();
  }

  initializeWebcamVideo() {
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
      this.video.srcObject = stream;
      this.video.width = IMAGE_SIZE;
      this.video.height = IMAGE_SIZE;
      this.video.addEventListener('playing', () => this.videoPlaying = true);
      this.video.addEventListener('paused', () => this.videoPlaying = false);
    });
  }

  render() {
    return <div>
      <video ref={(el) => this.video = el} autoPlay="" playsInline="" width={IMAGE_SIZE} height={IMAGE_SIZE}/>
      <div style={{marginBottom: 10}}>
        <i>Click each &lsquo;train&rsquo; button to train the computer on one frame from your camera</i><br/>
      </div>
      <button
        style={{position: 'absolute', left: '300px', top: '180px', width: '80px', height: '40px',}}
        onClick={() => this.playRound()}
      >
        PLAY ROUND
      </button>
      {
        [...Array(NUM_CLASSES).keys()].map((index) => {
          return (<div key={index.toString()} style={{marginBottom: "10px"}}>
            <button
              style={{height: '40px'}}
              onClick={() => {
                this.training = index;
                this.trainExample();
              }}
            >
              Train {CLASS_NAMES[index]}
            </button>
            <span style={{fontWeight: this.state.predictedClass === index ? "bold" : "normal"}}>{this.state[`infoText${index}`]}</span>
            {
              this.state['trainingImages' + index].map((image, i) => {
                return <img key={i} src={image} width={40} height={40}/>;
              })
            }
          </div>);
        })
      }
    </div>;
  }

  async initializeClassifiers() {
    this.featureExtractor = await ml5.featureExtractor('MobileNet');
    this.knnClassifier = await ml5.KNNClassifier();
    await this.startVideo();
  }

  async startVideo() {
    await this.video.play();
  }

  stopVideo() {
    this.video.pause();
  }

  async trainExample() {
    if (this.videoPlaying) {

      // // Get image data from video element
      // const image = tf.fromPixels(this.video);
      // let logits;
      // // 'conv_preds' is the logits activation of MobileNet.
      // const infer = () => this.mobilenet.infer(image, 'conv_preds');

      const canvas = document.createElement('canvas');
      canvas.width = IMAGE_SIZE / 4;
      canvas.height = IMAGE_SIZE / 4;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      const dataURI = canvas.toDataURL('image/jpeg');
      this.setState({
        ['trainingImages' + this.training]: this.state['trainingImages' + this.training].concat(dataURI)
      });

      // Train class if one of the buttons is held down
      if (this.training !== -1) {
        console.log("extract");
        const features = await this.featureExtractor.infer(this.video);
        console.log("add");
        await this.knnClassifier.addExample(features, this.training);
        console.log("done");
      }
      example_counts[this.training]++;
      if (example_counts[this.training] > 0) {
        this.setState({
          [`infoText${this.training}`]: ` ${example_counts[this.training]} examples ${(example_counts[this.training] >=
          MIN_EXAMPLES ? '✅' : '')}`
        });
      }
    }
  }

  async playRound() {
    if (this.videoPlaying) {
      const features = this.featureExtractor.infer(this.video);
      const numClasses = this.knnClassifier.getNumLabels();
      if (numClasses > 0) {

        await this.knnClassifier.classify(features, (err, result) => {
          if (!!err) {
            console.log(err);
          }
          if (result.confidences) {
            const confidences = result.confidences;
            // result.label is the label that has the highest confidence
            for (let i = 0; i < NUM_CLASSES; i++) {
              const exampleCount = this.knnClassifier.getCount();
              if (result.classIndex === i) {
                this.setState({predictedClass: i}, () => this.roundResult());
              }

              // Update info text
              if (exampleCount[i] > 0) {
                this.setState({
                  [`infoText${i}`]: ` ${exampleCount[i]} examples - ${confidences[i] * 100}%`
                }, null);
              }
            }
          }
        });
      }
    }
  }

  roundResult() {
    let computer_choice = CLASS_NAMES[Math.floor(Math.random() * 3)];
    const winner = this.pickWinner(computer_choice);
    console.log(winner);
    alert(
      `You played...${CLASS_NAMES[this.state.predictedClass]}\n Computer played ${computer_choice}\n${winner > 0 ? 'YOU WIN' : winner === 0 ? 'DRAW' : 'YOU LOSE'}`);

  }

  pickWinner(computer_choice) {
    return this.beats(CLASS_NAMES[this.state.predictedClass], computer_choice);
  }

  beats(x, y) {
    const keyBeatsValue = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };

    return keyBeatsValue[x] === y ? 1 :
      keyBeatsValue[y] === x ? -1 :
        0;
  }
};

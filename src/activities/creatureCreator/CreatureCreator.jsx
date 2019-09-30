import React from 'react';
import sketch, {CreatureType} from './sketches';
import Button from 'react-bootstrap/lib/Button';
const P5 = require('./loadP5');
import {ChromePicker} from 'react-color';

const CANVAS_ID = 'p5-canvas';

export default class CreatureCreator extends React.Component {
  componentDidMount() {
    this.p5 = new P5(sketch, CANVAS_ID);
  }

  setCreature = type => {
    if (!Object.values(CreatureType).includes(type)) {
      console.error('Unknown CreatureType!');
      return;
    }

    this.p5.setCreature(type);
  };

  download = () => {
    this.p5.download(CANVAS_ID);
  };

  onBodySizeChange = () => {
    var bodyWidth = document.getElementById('bodyWidthSlider').value;
    var bodyHeight = document.getElementById('bodyHeightSlider').value;
    this.p5.setBodySize(bodyWidth / 100, bodyHeight / 100);
  };

  onMouthSizeChange = () => {
    var mouthWidth = document.getElementById('mouthWidthSlider').value;
    var mouthHeight = document.getElementById('mouthHeightSlider').value;
    this.p5.setMouthSize(mouthWidth / 100, mouthHeight / 100);
  };

  onEyeSizeOrPosChange = () => {
    var eyeSize = document.getElementById('eyeSizeSlider').value;
    var leftEyeXPos = document.getElementById('leftEyeXSlider').value;
    var eyeYPos = document.getElementById('eyeYSlider').value;
    this.p5.setEyeSizeAndPos(eyeSize / 100, leftEyeXPos / 100, eyeYPos / 100);
  };

  onColorPickerChange = color => {
    console.log(color);
    this.p5.setBodyColor(color.rgb.r, color.rgb.g, color.rgb.b);
  };

  render() {
    return (
      <div>
        <h4>Click a button to generate a good or bad creature.</h4>
        <Button onClick={() => this.setCreature(CreatureType.Good)}>
          Good
        </Button>
        <Button onClick={() => this.setCreature(CreatureType.Bad)}>Bad</Button>
        <br />
        Body Width
        <input
          id="bodyWidthSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          onChange={() => this.onBodySizeChange()}
          style={{width: '200px'}}
        />
        <br />
        Body Height
        <input
          id="bodyHeightSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          onChange={() => this.onBodySizeChange()}
          style={{width: '200px'}}
        />
        <br />
        <br />
        Mouth Width
        <input
          id="mouthWidthSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          onChange={() => this.onMouthSizeChange()}
          style={{width: '200px'}}
        />
        <br />
        Mouth Height
        <input
          id="mouthHeightSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          onChange={() => this.onMouthSizeChange()}
          style={{width: '200px'}}
        />
        <br />
        Body Color
        <ChromePicker
          onChange={color => this.onColorPickerChange(color)}
          disableAlpha={true}
        />
        <br />
        <br />
        Eye Size
        <input
          id="eyeSizeSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          onChange={() => this.onEyeSizeOrPosChange()}
          style={{width: '200px'}}
        />
        <br />
        Left Eye X Pos
        <input
          id="leftEyeXSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          onChange={() => this.onEyeSizeOrPosChange()}
          style={{width: '200px'}}
        />
        <br />
        Eye Y Pos
        <input
          id="eyeYSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          onChange={() => this.onEyeSizeOrPosChange()}
          style={{width: '200px'}}
        />
        <br />
        <div id={CANVAS_ID} />
        <br />
        <br />
        <Button onClick={() => this.download()}>Download as .png</Button>
      </div>
    );
  }
}

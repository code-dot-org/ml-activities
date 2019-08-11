import React from 'react';
import RPS from './activities/rps/RPS';
// import RPSML5 from './activities/rpsML5/RPSML5';

const Activity = Object.freeze({
  None: 0,
  RPS: 1,
  RPSML5: 2,
});

module.exports = class MLActivities extends React.Component {
  state = {
    currentActivity: Activity.RPS,
  };

  render() {
    return <div>
      <h1>
        ML Activities Playground
      </h1>
      {
        this.state.currentActivity !== Activity.RPS &&
        <button
          style={{height: 40}}
          onClick={() => this.setState({
            currentActivity: Activity.RPS
          })}
        >
          Pick RPS Activity
        </button>
      }
      {
        this.state.currentActivity === Activity.RPS &&
        <RPS/>
      }
      {
        this.state.currentActivity === Activity.None &&
        <button
          style={{height: 40}}
          onClick={() => this.setState({
            currentActivity: Activity.RPSML5
          })}
        >
          Pick RPSML5 Activity
        </button>
      }
      {
        // this.state.currentActivity === Activity.RPSML5 &&
        // <RPSML5/>
      }
    </div>;
  }
};

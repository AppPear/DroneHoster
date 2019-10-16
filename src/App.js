import React, { Component } from 'react';
import './App.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM, OrbitView} from '@deck.gl/core';
import {PointCloudLayer, PathLayer} from '@deck.gl/layers';
const client = new W3CWebSocket('ws://192.168.2.56:8000');

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 50,
  minZoom: 0,
  maxZoom: 10,
  zoom: 5
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE,
      cloudPoints: [],
      coordinates: [{position: [[0,0,0]]}]
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  componentWillMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      this.setState({
        cloudPoints: [...this.state.cloudPoints, ...dataFromServer.pointCloud],
        coordinates: [{position: [...this.state.coordinates[0].position, dataFromServer.coordinate]}]
      })
    }
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  render() {
    const { cloudPoints, coordinates, viewState} = this.state
    const layers = [
      new PointCloudLayer({
        id: 'drone-point-cloud-layer',
        data: cloudPoints,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        pointSize: 0.007,
        getColor: [255, 255, 255],
        getNormal: [0, 1, 0],
        sizeUnits: 'meters'
      }),
      new PathLayer({
        id: 'drone-path-layer',
        data: coordinates,
        getPath: d => d.position,
        getWidth: 2,
        widthMinPixels: 2,
        widthMaxPixels: 2,
        sizeUnits: 'pixels',
        getColor: [255, 0, 0],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        positionFormat: 'XYZ',
        miterLimit: 10,
        billboard: true,
      })
    ];

    return (
      <div className="App">
        <header className="App-header">
          <DeckGL
            views={new OrbitView()}
            viewState={viewState}
            controller={true}
            onViewStateChange={this._onViewStateChange}
            layers={layers}
            parameters={{
              clearColor: [0.5, 0.5, 0.5, 1]
            }}
          />
        </header>
      </div>
    );
  }

}

export default App;

import React, { Component } from 'react';
import { View, ViewStyle } from 'react-native';
import { Polygon, Polyline, Marker } from 'react-native-maps';
import { LatLng } from 'src/SharedTypes';

interface XMarksTheSpotProps {
  coordinates?: LatLng[];
  center?: LatLng;
  zIndex?: number;
  style?: ViewStyle;
}

class XMarksTheSpot extends Component<XMarksTheSpotProps> {
  render() {
    const { coordinates, center, style } = this.props;

    if (!coordinates || coordinates.length < 4) {
      return null;
    }

    return (
      <View style={style}>
        <Polygon
          coordinates={coordinates}
          strokeColor="rgba(0, 0, 0, 1)"
          strokeWidth={3}
          zIndex={this.props.zIndex}
        />
        <Polyline
          coordinates={[coordinates[0], coordinates[2]]}
          strokeColor="rgba(0, 0, 0, 1)"
          strokeWidth={3}
          zIndex={this.props.zIndex}
        />
        <Polyline
          coordinates={[coordinates[1], coordinates[3]]}
          strokeColor="rgba(0, 0, 0, 1)"
          strokeWidth={3}
          zIndex={this.props.zIndex}
        />
        {center && <Marker coordinate={center} />}
      </View>
    );
  }
}

export default XMarksTheSpot;

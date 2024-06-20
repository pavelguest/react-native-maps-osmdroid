import React from 'react';
import { StyleSheet, ViewProps, View } from 'react-native';
import decorateMapComponent, {
  SUPPORTED,
  NOT_SUPPORTED,
} from './decorateMapComponent';

interface MapCalloutSubviewProps extends ViewProps {
  onPress?: () => void;
}

const defaultProps: Partial<MapCalloutSubviewProps> = {};

class MapCalloutSubview extends React.Component<MapCalloutSubviewProps> {
  render() {
    const AIRMapCalloutSubview = this.getAirComponent();
    return (
      <AIRMapCalloutSubview
        {...this.props}
        style={[styles.calloutSubview, this.props.style]}
      />
    );
  }
}

MapCalloutSubview.defaultProps = defaultProps;

const styles = StyleSheet.create({
  calloutSubview: {},
});

export default decorateMapComponent(MapCalloutSubview, {
  componentType: 'CalloutSubview',
  providers: {
    google: {
      ios: SUPPORTED,
      android: NOT_SUPPORTED,
    },
  },
});

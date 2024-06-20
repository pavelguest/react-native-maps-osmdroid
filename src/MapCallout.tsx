import React from 'react';
import { StyleSheet, ViewProps, View } from 'react-native';
import decorateMapComponent, {
  SUPPORTED,
  USES_DEFAULT_IMPLEMENTATION,
} from './decorateMapComponent';

interface MapCalloutProps extends ViewProps {
  tooltip?: boolean;
  onPress?: () => void;
  alphaHitTest?: boolean;
}

const defaultProps: Partial<MapCalloutProps> = {
  tooltip: false,
  alphaHitTest: false,
};

class MapCallout extends React.Component<MapCalloutProps> {
  render() {
    const AIRMapCallout = this.getAirComponent();
    return (
      <AIRMapCallout
        {...this.props}
        style={[styles.callout, this.props.style]}
      />
    );
  }
}

MapCallout.defaultProps = defaultProps;

const styles = StyleSheet.create({
  callout: {
    position: 'absolute',
  },
});

export default decorateMapComponent(MapCallout, {
  componentType: 'Callout',
  providers: {
    google: {
      ios: SUPPORTED,
      android: SUPPORTED,
    },
    osmdroid: {
      android: USES_DEFAULT_IMPLEMENTATION,
    },
  },
});

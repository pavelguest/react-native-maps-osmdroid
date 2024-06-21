import React from 'react';
import { View, ViewProps, ColorValue, ViewStyle } from 'react-native';
import decorateMapComponent, {
  USES_DEFAULT_IMPLEMENTATION,
  SUPPORTED,
} from './decorateMapComponent';

// Define the prop types using TypeScript interfaces
interface MapCircleProps extends ViewProps {
  // The coordinate of the center of the circle
  center: {
    // Coordinates for the center of the circle.
    latitude: number,
    longitude: number,
  };
  // The radius of the circle to be drawn (in meters)
  radius: number;
  // Callback that is called when the user presses on the circle
  onPress?: () => void;
  // The stroke width to use for the path.
  strokeWidth?: number;
  // The stroke color to use for the path.
  strokeColor?: ColorValue;
  // The fill color to use for the path.
  fillColor?: ColorValue;
  // The order in which this tile overlay is drawn with respect to other overlays.
  zIndex?: number;
  // The line cap style to apply to the open ends of the path.
  lineCap?: 'butt' | 'round' | 'square';
  // The line join style to apply to corners of the path.
  lineJoin?: 'miter' | 'round' | 'bevel';
  // The limiting value that helps avoid spikes at junctions between connected line segments.
  miterLimit?: number;
  // The offset (in points) at which to start drawing the dash pattern.
  lineDashPhase?: number;
  // An array of numbers specifying the dash pattern to use for the path.
  lineDashPattern?: number[];
}

// Define the default prop values
const defaultProps: Partial<MapCircleProps> = {
  strokeColor: '#000',
  strokeWidth: 1,
};

class MapCircle extends React.Component<MapCircleProps> {
  // Define defaultProps to use them as default values for props
  static defaultProps = defaultProps;

  // Method to set native properties on the circle
  setNativeProps(props: any) {
    this.circle.setNativeProps(props);
  }

  render() {
    const AIRMapCircle = this.getAirComponent();
    return (
      <AIRMapCircle
        {...this.props}
        ref={ref => {
          this.circle = ref;
        }}
      />
    );
  }
}

export default decorateMapComponent(MapCircle, {
  componentType: 'Circle',
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

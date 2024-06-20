import React from 'react';
import { ViewProps, processColor } from 'react-native';
import decorateMapComponent, {
  SUPPORTED,
  USES_DEFAULT_IMPLEMENTATION,
} from './decorateMapComponent';

// Define interfaces for prop types
interface Point {
  /**
   * Latitude/Longitude coordinates
   */
  latitude: number;
  longitude: number;
  weight?: number;
}

interface Gradient {
  /**
   * Colors (one or more) to use for gradient.
   */
  colors: string[];
  /**
   * Array of floating point values from 0 to 1 representing
   * where each color starts.
   */
  startPoints: number[];
  /**
   * Resolution of color map -- number corresponding to the
   * number of steps colors are interpolated into (default 256).
   */
  colorMapSize?: number;
}

interface MapHeatmapProps extends ViewProps {
  /**
   * Array of heatmap entries to apply towards density.
   */
  points?: Point[];
  /**
   * The radius of the heatmap points in pixels, between 10 and 50
   * (default 20).
   */
  radius?: number;
  /**
   * The opacity of the heatmap (default 0.7).
   */
  opacity?: number;
  /**
   * Heatmap gradient configuration.
   */
  gradient?: Gradient;
}

const defaultProps = {
  strokeColor: '#000',
  strokeWidth: 1,
};

class MapHeatmap extends React.Component<MapHeatmapProps> {
  heatmap: any;

  setNativeProps(props: Partial<MapHeatmapProps>) {
    if (this.heatmap) {
      this.heatmap.setNativeProps(props);
    }
  }

  render() {
    const AIRMapHeatmap = this.getAirComponent();
    let gradient: Gradient | undefined;
    if (this.props.gradient) {
      gradient = { ...this.props.gradient };
      gradient.colors = gradient.colors.map(c => processColor(c));
    }
    return (
      <AIRMapHeatmap
        {...this.props}
        gradient={gradient}
        ref={ref => {
          this.heatmap = ref;
        }}
      />
    );
  }
}

MapHeatmap.defaultProps = defaultProps;

export default decorateMapComponent(MapHeatmap, {
  componentType: 'Heatmap',
  providers: {
    google: {
      ios: SUPPORTED,
      android: USES_DEFAULT_IMPLEMENTATION,
    },
  },
});

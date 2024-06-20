import React from 'react';
import { View, ViewProps } from 'react-native';
import decorateMapComponent, {
  USES_DEFAULT_IMPLEMENTATION,
  SUPPORTED,
} from './decorateMapComponent';

// Define interface for component props extending ViewProps
interface MapLocalTileProps extends ViewProps {
  /**
   * The path template of the local tile source.
   * The patterns {x} {y} {z} will be replaced at runtime,
   * for example, /storage/emulated/0/tiles/{z}/{x}/{y}.png.
   */
  pathTemplate: string;

  /**
   * The order in which this tile overlay is drawn with respect to other overlays. An overlay
   * with a larger z-index is drawn over overlays with smaller z-indices. The order of overlays
   * with the same z-index is arbitrary. The default zIndex is -1.
   *
   * @platform android
   */
  zIndex?: number;

  /**
   * Size of tile images.
   */
  tileSize?: number;
}

class MapLocalTile extends React.Component<MapLocalTileProps> {
  render() {
    const AIRMapLocalTile = this.getAirComponent();
    return <AIRMapLocalTile {...this.props} />;
  }
}

export default decorateMapComponent(MapLocalTile, {
  componentType: 'LocalTile',
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

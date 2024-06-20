import React from 'react';
import { View, ViewProps } from 'react-native';
import decorateMapComponent, {
  USES_DEFAULT_IMPLEMENTATION,
  SUPPORTED,
} from './decorateMapComponent';

// Define interface for component props extending ViewProps
interface MapWMSTileProps extends ViewProps {
  /**
   * The url template of the tile server. The patterns {minX} {maxX} {minY} {maxY} {width} {height}
   * will be replaced at runtime according to EPSG:900913 specification bounding box.
   * For example, https://demo.geo-solutions.it/geoserver/tiger/wms?service=WMS&version=1.1.0&request=GetMap&layers=tiger:poi&styles=&bbox={minX},{minY},{maxX},{maxY}&width={width}&height={height}&srs=EPSG:900913&format=image/png&transparent=true&format_options=dpi:213
   */
  urlTemplate: string;

  /**
   * The order in which this tile overlay is drawn with respect to other overlays. An overlay
   * with a larger z-index is drawn over overlays with smaller z-indices. The order of overlays
   * with the same z-index is arbitrary. The default zIndex is -1.
   *
   * @platform android
   */
  zIndex?: number;

  /**
   * The maximum zoom level for this tile overlay.
   */
  maximumZ?: number;

  /**
   * The minimum zoom level for this tile overlay.
   */
  minimumZ?: number;

  /**
   * Corresponds to MKTileOverlay canReplaceMapContent.
   *
   * @platform ios
   */
  shouldReplaceMapContent?: boolean;

  /**
   * Tile size.
   */
  tileSize?: number;

  /**
   * Opacity. Between 0 - 1.
   */
  opacity?: number;
}

class MapWMSTile extends React.Component<MapWMSTileProps> {
  render() {
    const AIRMapWMSTile = this.getAirComponent();
    return <AIRMapWMSTile {...this.props} />;
  }
}

export default decorateMapComponent(MapWMSTile, {
  componentType: 'WMSTile',
  providers: {
    google: {
      ios: SUPPORTED,
      android: USES_DEFAULT_IMPLEMENTATION,
    },
  },
});

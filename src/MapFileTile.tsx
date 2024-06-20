import React from 'react';
import { View, ViewProps } from 'react-native';
import decorateMapComponent, {
  USES_DEFAULT_IMPLEMENTATION,
  SUPPORTED,
} from './decorateMapComponent';

// Define interface for component props extending ViewProps
interface MapFileTileProps extends ViewProps {
  fileDirPath?: string;

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
   * (Optional) Tile size for iOS only, default size is 256 * 256.
   *
   * @platform ios
   */
  tileSize?: number;
}

class MapFileTile extends React.Component<MapFileTileProps> {
  render() {
    const AIRMapUrlTile = this.getAirComponent();
    return <AIRMapUrlTile {...this.props} />;
  }
}

export default decorateMapComponent(MapFileTile, {
  componentType: 'FileTile',
  providers: {
    osmdroid: {
      android: USES_DEFAULT_IMPLEMENTATION,
    },
  },
});

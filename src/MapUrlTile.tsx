import * as React from 'react';
import { ViewProps, View } from 'react-native';
import decorateMapComponent, {
  USES_DEFAULT_IMPLEMENTATION,
  SUPPORTED,
} from './decorateMapComponent';

// Определяем интерфейс для пропсов компонента MapUrlTile
interface MapUrlTileProps extends ViewProps {
  /**
   * The url template of the tile server. The patterns {x} {y} {z} will be replaced at runtime
   * For example, http://c.tile.openstreetmap.org/{z}/{x}/{y}.png
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
   *
   */
  maximumZ?: number;

  /**
   * The minimum zoom level for this tile overlay.
   *
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

  /**
   * Allow tiles using the TMS coordinate system (origin bottom left)
   * to be used, and displayed at their correct coordinates
   */
  flipY?: boolean;
}

class MapUrlTile extends React.Component<MapUrlTileProps> {
  render() {
    const AIRMapUrlTile = this.getAirComponent();
    return <AIRMapUrlTile {...this.props} />;
  }
}

export default decorateMapComponent(MapUrlTile, {
  componentType: 'UrlTile',
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

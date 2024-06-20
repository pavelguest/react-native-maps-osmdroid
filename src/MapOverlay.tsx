import React, { Component, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  ViewProps,
  ImageSourcePropType,
} from 'react-native';

import decorateMapComponent, {
  SUPPORTED,
  USES_DEFAULT_IMPLEMENTATION,
} from './decorateMapComponent';

interface MapOverlayProps extends ViewProps {
  /**
   * A custom image to be used as overlay.
   */
  image: ImageSourcePropType;
  /**
   * Top left and bottom right coordinates for the overlay
   */
  bounds: Array<Array<number>>;
  /**
   * Boolean to allow an overlay to be tappable and use the onPress function
   */
  tappable?: boolean;
  /**
   * Callback that is called when the user presses on the overlay
   */
  onPress?: () => void;
  /**
   * The opacity of the overlay.
   */
  opacity?: number;
}

const viewConfig = {
  uiViewClassName: 'AIR<provider>MapOverlay',
  validAttributes: {
    image: true,
  },
};

class MapOverlay extends Component<MapOverlayProps> {
  /**
   * Render method for MapOverlay component.
   */
  render(): ReactNode {
    let image: string | null = null;
    if (this.props.image) {
      if (
        typeof this.props.image === 'string' &&
        this.props.image.startsWith('http')
      ) {
        image = this.props.image;
      } else {
        const resolvedImage = Image.resolveAssetSource(this.props.image);
        image = resolvedImage ? resolvedImage.uri : null;
      }
    }

    const AIRMapOverlay = this.getAirComponent();

    return (
      <AIRMapOverlay
        {...this.props}
        image={image}
        style={[styles.overlay, this.props.style]}
      />
    );
  }
}

MapOverlay.viewConfig = viewConfig;
MapOverlay.defaultProps = {
  opacity: 1.0,
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

MapOverlay.Animated = Animated.createAnimatedComponent(MapOverlay);

export default decorateMapComponent(MapOverlay, {
  componentType: 'Overlay',
  providers: {
    google: {
      ios: SUPPORTED,
      android: SUPPORTED,
    },
  },
});

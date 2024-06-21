import React from 'react';
import {
  EdgeInsetsPropType,
  PointPropType,
  Platform,
  Animated as RNAnimated,
  requireNativeComponent,
  NativeModules,
  ColorPropType,
  findNodeHandle,
  View,
} from 'react-native';
import MapMarker from './MapMarker';
import MapPolyline from './MapPolyline';
import MapPolygon from './MapPolygon';
import MapCircle from './MapCircle';
import MapCallout from './MapCallout';
import MapCalloutSubview from './MapCalloutSubview';
import MapOverlay from './MapOverlay';
import MapUrlTile from './MapUrlTile';
import MapFileTile from './MapFileTile';
import MapWMSTile from './MapWMSTile';
import MapLocalTile from './MapLocalTile';
import MapHeatMap from './MapHeatmap';
import AnimatedRegion from './AnimatedRegion';
import Geojson from './Geojson';
import {
  contextTypes as childContextTypes,
  getAirMapName,
  googleMapIsInstalled,
  osmdroidIsInstalled,
  createNotSupportedComponent,
} from './decorateMapComponent';
import * as ProviderConstants from './ProviderConstants';

export const MAP_TYPES = {
  STANDARD: 'standard',
  SATELLITE: 'satellite',
  HYBRID: 'hybrid',
  TERRAIN: 'terrain',
  NONE: 'none',
  MUTEDSTANDARD: 'mutedStandard',
};

const GOOGLE_MAPS_ONLY_TYPES = [MAP_TYPES.TERRAIN, MAP_TYPES.NONE];

const viewConfig = {
  uiViewClassName: 'AIR<provider>Map',
  validAttributes: {
    region: true,
  },
};

/**
 * Defines the map camera.
 */
interface CameraShape {
  center: {
    latitude: number;
    longitude: number;
  };
  pitch?: number;
  heading?: number;
  altitude?: number;
  zoom?: number;
}

/**
 * Interface for defining the region displayed by the map.
 */
interface IRegion {
  latitude: number; // Coordinates for the center of the map.
  longitude: number;
  latitudeDelta: number; // Difference between the minimum and the maximum latitude/longitude to be displayed.
  longitudeDelta: number;
}

/**
 * Props for the MapView component.
 */
interface MapViewProps {
  provider?: 'google' | 'osmdroid'; // Map provider: 'google' or 'osmdroid'.
  style?: ViewStyle; // Style and layout for the MapView component.
  customMapStyle?: Array<any>; // JSON object describing the style of the map.
  customMapStyleString?: string; // JSON string describing the style of the map.
  showsUserLocation?: boolean; // Show user's location on the map.
  userLocationAnnotationTitle?: string; // Title of the annotation for the user's location (iOS only).
  showsMyLocationButton?: boolean; // Show button to move map to the current user's location (Android only).
  followsUserLocation?: boolean; // Focus on the user's location as it updates (iOS only).
  showsPointsOfInterest?: boolean; // Show points of interest on the map.
  showsCompass?: boolean; // Show compass on the map (iOS only).
  zoomEnabled?: boolean; // Enable pinch/zoom on the map.
  zoomTapEnabled?: boolean; // Enable double tap to zoom on the map.
  zoomControlEnabled?: boolean; // Enable zoom controls on the map (Android only).
  rotateEnabled?: boolean; // Enable pinch/rotate on the map.
  cacheEnabled?: boolean; // Cache the map as an image for performance.
  loadingEnabled?: boolean; // Show a loading indicator on the map.
  loadingBackgroundColor?: ColorValue; // Background color for the loading indicator.
  loadingIndicatorColor?: ColorValue; // Color for the loading indicator.
  scrollEnabled?: boolean; // Enable scroll on the map.
  pitchEnabled?: boolean; // Enable adjusting the camera’s pitch angle.
  toolbarEnabled?: boolean; // Show 'Navigate' and 'Open in Maps' buttons on marker press (Android only).
  moveOnMarkerPress?: boolean; // Move map to the pressed marker on marker press (Android only).
  showsScale?: boolean; // Show scale information on the map (iOS only).
  showsBuildings?: boolean; // Show extruded building information on the map.
  showsTraffic?: boolean; // Show traffic information on the map.
  showsIndoors?: boolean; // Enable indoor maps (Android only).
  showsIndoorLevelPicker?: boolean; // Enable indoor level picker (Android only).
  mapType?: keyof typeof MAP_TYPES; // Type of map to display.
  region?: IRegion; // Region to be displayed by the map.
  initialRegion?: IRegion; // Initial region to be displayed by the map.
  camera?: CameraShape; // Camera view the map should use.
  initialCamera?: CameraShape; // Initial camera view the map should use.
  liteMode?: boolean; // Use liteMode for Android.
  mapPadding?: EdgeInsets; // Padding for the map.
  paddingAdjustmentBehavior?: 'always' | 'automatic' | 'never'; // Adjustment behavior for safe area padding on iOS.
  maxDelta?: number; // Maximum size of area that can be displayed (iOS only).
  minDelta?: number; // Minimum size of area that can be displayed (iOS only).
  legalLabelInsets?: EdgeInsets; // Insets for the map's legal label.
  onMapReady?: () => void; // Callback when the map is fully loaded.
  onMapLoaded?: () => void; // Callback when all tiles have been loaded.
  onKmlReady?: () => void; // Callback when KML is fully loaded.
  onRegionChange?: (region: IRegion) => void; // Callback continuously when the user is dragging the map.
  onRegionChangeComplete?: (region: IRegion) => void; // Callback when the user is done moving the map.
  onPress?: (event: any) => void; // Callback when the user taps on the map.
  onDoublePress?: (event: any) => void; // Callback when the user double taps on the map.
  onLongPress?: (event: any) => void; // Callback when the user makes a "long press" on the map.
  onUserLocationChange?: (event: any) => void; // Callback when the map determines the user's current location.
  onPanDrag?: (event: any) => void; // Callback when the user makes a "drag" on the map.
  onPoiClick?: (event: any) => void; // Callback when the user clicks on a POI.
  onMarkerPress?: (event: any) => void; // Callback when a marker on the map is tapped.
  onMarkerSelect?: (event: any) => void; // Callback when a marker on the map becomes selected (iOS only).
  onMarkerDeselect?: (event: any) => void; // Callback when a marker on the map becomes deselected (iOS only).
  onCalloutPress?: (event: any) => void; // Callback when a callout on the map is tapped.
  onMarkerDragStart?: (event: any) => void; // Callback when a drag on a marker starts.
  onMarkerDrag?: (event: any) => void; // Callback continuously as a marker is dragged.
  onMarkerDragEnd?: (event: any) => void; // Callback when a drag on a marker ends.
  minZoomLevel?: number; // Minimum zoom value for the map.
  maxZoomLevel?: number; // Maximum zoom value for the map.
  kmlSrc?: string; // URL KML source.
  compassOffset?: { x: number; y: number }; // Offset for compass location (iOS only).
  onIndoorLevelActivated?: (event: any) => void; // Callback when a level is activated in an indoor building.
  onIndoorBuildingFocused?: (event: any) => void; // Callback when a building is focused indoors.
  tintColor?: ColorValue; // Tint color of the map (iOS only).
}

class MapView extends React.Component<MapViewProps> {
  constructor(props) {
    super(props);

    this.state = {
      isReady: Platform.OS === 'ios',
    };

    this._onMapReady = this._onMapReady.bind(this);
    this._onMarkerPress = this._onMarkerPress.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onLayout = this._onLayout.bind(this);
  }

  setNativeProps(props) {
    this.map.setNativeProps(props);
  }

  getChildContext() {
    return { provider: this.props.provider };
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (
      this.state.isReady &&
      this.props.customMapStyle !== prevProps.customMapStyle
    ) {
      this._updateStyle(this.props);
    }
    return this.props.region || null;
  }

  componentDidUpdate(prevProps, prevState, region) {
    const a = this.__lastRegion;
    const b = region;
    if (!a || !b) {
      return;
    }
    if (
      a.latitude !== b.latitude ||
      a.longitude !== b.longitude ||
      a.latitudeDelta !== b.latitudeDelta ||
      a.longitudeDelta !== b.longitudeDelta
    ) {
      this.map.setNativeProps({ region: b });
    }
  }

  componentDidMount() {
    const { isReady } = this.state;
    if (isReady) {
      this._updateStyle(this.props);
    }
  }

  _updateStyle(props) {
    const { customMapStyle } = props;
    this.map.setNativeProps({
      customMapStyleString: JSON.stringify(customMapStyle),
    });
  }

  _onMapReady() {
    const { region, initialRegion, onMapReady } = this.props;
    if (region) {
      this.map.setNativeProps({ region });
    } else if (initialRegion) {
      this.map.setNativeProps({ initialRegion });
    }
    this._updateStyle(this.props);
    this.setState({ isReady: true }, () => {
      if (onMapReady) {
        onMapReady();
      }
    });
  }

  _onLayout(e) {
    const { layout } = e.nativeEvent;
    if (!layout.width || !layout.height) {
      return;
    }
    if (this.state.isReady && !this.__layoutCalled) {
      const { region, initialRegion } = this.props;
      if (region) {
        this.__layoutCalled = true;
        this.map.setNativeProps({ region });
      } else if (initialRegion) {
        this.__layoutCalled = true;
        this.map.setNativeProps({ initialRegion });
      }
    }
    if (this.props.onLayout) {
      this.props.onLayout(e);
    }
  }

  _onMarkerPress(event) {
    if (this.props.onMarkerPress) {
      this.props.onMarkerPress(event.nativeEvent);
    }
  }

  _onChange({ nativeEvent }) {
    this.__lastRegion = nativeEvent.region;
    const isGesture = nativeEvent.isGesture;
    const details = { isGesture };

    if (nativeEvent.continuous) {
      if (this.props.onRegionChange) {
        this.props.onRegionChange(nativeEvent.region, details);
      }
    } else if (this.props.onRegionChangeComplete) {
      this.props.onRegionChangeComplete(nativeEvent.region, details);
    }
  }

  getCamera() {
    if (Platform.OS === 'android') {
      return NativeModules.AirMapModule.getCamera(this._getHandle());
    } else if (Platform.OS === 'ios') {
      return this._runCommand('getCamera', []);
    }
    return Promise.reject('getCamera not supported on this platform');
  }

  setCamera(camera) {
    this._runCommand('setCamera', [camera]);
  }

  animateCamera(camera, opts) {
    this._runCommand('animateCamera', [camera, (opts && opts.duration) || 500]);
  }

  animateToNavigation(location, bearing, angle, duration) {
    console.warn(
      'animateToNavigation() is deprecated, use animateCamera() instead'
    );
    this._runCommand('animateToNavigation', [
      location,
      bearing,
      angle,
      duration || 500,
    ]);
  }

  animateToRegion(region, duration) {
    this._runCommand('animateToRegion', [region, duration || 500]);
  }

  animateToCoordinate(latLng, duration) {
    console.warn(
      'animateToCoordinate() is deprecated, use animateCamera() instead'
    );
    this._runCommand('animateToCoordinate', [latLng, duration || 500]);
  }

  animateToBearing(bearing, duration) {
    console.warn(
      'animateToBearing() is deprecated, use animateCamera() instead'
    );
    this._runCommand('animateToBearing', [bearing, duration || 500]);
  }

  animateToViewingAngle(angle, duration) {
    console.warn(
      'animateToViewingAngle() is deprecated, use animateCamera() instead'
    );
    this._runCommand('animateToViewingAngle', [angle, duration || 500]);
  }

  fitToElements(animated) {
    this._runCommand('fitToElements', [animated]);
  }

  fitToSuppliedMarkers(markers, options = {}) {
    const {
      edgePadding = { top: 0, right: 0, bottom: 0, left: 0 },
      animated = true,
    } = options;

    this._runCommand('fitToSuppliedMarkers', [markers, edgePadding, animated]);
  }

  fitToCoordinates(coordinates = [], options = {}) {
    const {
      edgePadding = { top: 0, right: 0, bottom: 0, left: 0 },
      animated = true,
    } = options;

    this._runCommand('fitToCoordinates', [coordinates, edgePadding, animated]);
  }

  /**
   * Get visible boudaries
   *
   * @return Promise Promise with the bounding box ({ northEast: <LatLng>, southWest: <LatLng> })
   */
  async getMapBoundaries() {
    if (Platform.OS === 'android') {
      return await NativeModules.AirMapModule.getMapBoundaries(
        this._getHandle()
      );
    } else if (Platform.OS === 'ios') {
      return await this._runCommand('getMapBoundaries', []);
    }
    return Promise.reject('getMapBoundaries not supported on this platform');
  }

  setMapBoundaries(northEast, southWest) {
    this._runCommand('setMapBoundaries', [northEast, southWest]);
  }

  setIndoorActiveLevelIndex(activeLevelIndex) {
    this._runCommand('setIndoorActiveLevelIndex', [activeLevelIndex]);
  }

  /**
   * Takes a snapshot of the map and saves it to a picture
   * file or returns the image as a base64 encoded string.
   *
   * @param config Configuration options
   * @param [config.width] Width of the rendered map-view (when omitted actual view width is used).
   * @param [config.height] Height of the rendered map-view (when omitted actual height is used).
   * @param [config.region] Region to render (Only supported on iOS).
   * @param [config.format] Encoding format ('png', 'jpg') (default: 'png').
   * @param [config.quality] Compression quality (only used for jpg) (default: 1.0).
   * @param [config.result] Result format ('file', 'base64') (default: 'file').
   *
   * @return Promise Promise with either the file-uri or base64 encoded string
   */
  takeSnapshot(args) {
    // For the time being we support the legacy API on iOS.
    // This will be removed in a future release and only the
    // new Promise style API shall be supported.
    if (Platform.OS === 'ios' && arguments.length === 4) {
      console.warn(
        'Old takeSnapshot API has been deprecated; will be removed in the near future'
      );
      const width = arguments[0];
      const height = arguments[1];
      const region = arguments[2];
      const callback = arguments[3];
      this._runCommand('takeSnapshot', [
        width || 0,
        height || 0,
        region || {},
        'png',
        1,
        'legacy',
        callback,
      ]);
      return undefined;
    }

    // Sanitize inputs
    const config = {
      width: args.width || 0,
      height: args.height || 0,
      region: args.region || {},
      format: args.format || 'png',
      quality: args.quality || 1.0,
      result: args.result || 'file',
    };
    if (config.format !== 'png' && config.format !== 'jpg') {
      throw new Error('Invalid format specified');
    }
    if (config.result !== 'file' && config.result !== 'base64') {
      throw new Error('Invalid result specified');
    }

    // Call native function
    if (Platform.OS === 'android') {
      return NativeModules.AirMapModule.takeSnapshot(this._getHandle(), config);
    } else if (Platform.OS === 'ios') {
      return new Promise((resolve, reject) => {
        this._runCommand('takeSnapshot', [
          config.width,
          config.height,
          config.region,
          config.format,
          config.quality,
          config.result,
          (err, snapshot) => {
            if (err) {
              reject(err);
            } else {
              resolve(snapshot);
            }
          },
        ]);
      });
    }
    return Promise.reject('takeSnapshot not supported on this platform');
  }

  /**
   * Convert a map coordinate to user-space point
   *
   * @param coordinate Coordinate
   * @param [coordinate.latitude] Latitude
   * @param [coordinate.longitude] Longitude
   *
   * @return Promise Promise with the point ({ x: Number, y: Number })
   */
  pointForCoordinate(coordinate) {
    if (Platform.OS === 'android') {
      return NativeModules.AirMapModule.pointForCoordinate(
        this._getHandle(),
        coordinate
      );
    } else if (Platform.OS === 'ios') {
      return this._runCommand('pointForCoordinate', [coordinate]);
    }
    return Promise.reject('pointForCoordinate not supported on this platform');
  }

  /**
   * Convert a user-space point to a map coordinate
   *
   * @param point Point
   * @param [point.x] X
   * @param [point.x] Y
   *
   * @return Promise Promise with the coordinate ({ latitude: Number, longitude: Number })
   */
  coordinateForPoint(point) {
    if (Platform.OS === 'android') {
      return NativeModules.AirMapModule.coordinateForPoint(
        this._getHandle(),
        point
      );
    } else if (Platform.OS === 'ios') {
      return this._runCommand('coordinateForPoint', [point]);
    }
    return Promise.reject('coordinateForPoint not supported on this platform');
  }

  /**
   * Get markers' centers and frames in user-space coordinates
   *
   * @param onlyVisible boolean true to include only visible markers, false to include all
   *
   * @return Promise Promise with { <identifier>: { point: Point, frame: Frame } }
   */
  getMarkersFrames(onlyVisible = false) {
    if (Platform.OS === 'ios') {
      return this._runCommand('getMarkersFrames', [onlyVisible]);
    }
    return Promise.reject('getMarkersFrames not supported on this platform');
  }

  /**
   * Get bounding box from region
   *
   * @param region Region
   *
   * @return Object Object bounding box ({ northEast: <LatLng>, southWest: <LatLng> })
   */
  boundingBoxForRegion(region) {
    return {
      northEast: {
        latitude: region.latitude + region.latitudeDelta / 2,
        longitude: region.longitude + region.longitudeDelta / 2,
      },
      southWest: {
        latitude: region.latitude - region.latitudeDelta / 2,
        longitude: region.longitude - region.longitudeDelta / 2,
      },
    };
  }

  _uiManagerCommand(name) {
    const UIManager = NativeModules.UIManager;
    const componentName = getAirMapName(this.props.provider);

    if (!UIManager.getViewManagerConfig) {
      // RN < 0.58
      return UIManager[componentName].Commands[name];
    }

    // RN >= 0.58
    return UIManager.getViewManagerConfig(componentName).Commands[name];
  }

  _mapManagerCommand(name) {
    const managerName = getAirMapName(this.props.provider);

    if (managerName === 'UI') {
      const UIManager = NativeModules.UIManager;
      if (!UIManager.getViewManagerConfig) {
        // RN < 0.58
        return UIManager[name];
      }

      // RN >= 0.58
      return UIManager.getViewManagerConfig(name);
    }

    return NativeModules[`${getAirMapName(this.props.provider)}Manager`][name];
  }

  _getHandle() {
    return findNodeHandle(this.map);
  }

  _runCommand(name, args) {
    switch (Platform.OS) {
      case 'android':
        return NativeModules.UIManager.dispatchViewManagerCommand(
          this._getHandle(),
          this._uiManagerCommand(name),
          args
        );

      case 'ios':
        return this._mapManagerCommand(name)(this._getHandle(), ...args);

      default:
        return Promise.reject(`Invalid platform was passed: ${Platform.OS}`);
    }
  }

  render() {
    let props;

    if (this.state.isReady) {
      props = {
        region: null,
        initialRegion: null,
        onMarkerPress: this._onMarkerPress,
        onChange: this._onChange,
        onMapReady: this._onMapReady,
        onLayout: this._onLayout,
        ...this.props,
      };
      if (
        Platform.OS === 'ios' &&
        props.provider === ProviderConstants.PROVIDER_DEFAULT &&
        GOOGLE_MAPS_ONLY_TYPES.includes(props.mapType)
      ) {
        props.mapType = MAP_TYPES.standard;
      }
      props.handlePanDrag = !!props.onPanDrag;
    } else {
      props = {
        style: this.props.style,
        region: null,
        initialRegion: null,
        onMarkerPress: this._onMarkerPress,
        onChange: this._onChange,
        onMapReady: this._onMapReady,
        onLayout: this._onLayout,
      };
    }

    if (Platform.OS === 'android' && this.props.liteMode) {
      return (
        <AIRMapLite
          ref={ref => {
            this.map = ref;
          }}
          {...props}
        />
      );
    }

    const AIRMap = getAirMapComponent(this.props.provider);

    return (
      <AIRMap
        ref={ref => {
          this.map = ref;
        }}
        {...props}
      />
    );
  }
}

MapView.viewConfig = viewConfig;
MapView.childContextTypes = childContextTypes;

MapView.MAP_TYPES = MAP_TYPES;

const nativeComponent = Component =>
  requireNativeComponent(Component, MapView, {
    nativeOnly: {
      onChange: true,
      onMapReady: true,
      onKmlReady: true,
      handlePanDrag: true,
    },
  });
const airMaps = {};
if (Platform.OS === 'android') {
  airMaps.google = googleMapIsInstalled
    ? nativeComponent('AIRMap')
    : createNotSupportedComponent(
        'react-native-maps: google maps dependecy must be added to your app build.gradle to support google provider.'
      ); // eslint-disable-line max-len
  airMaps.osmdroid = osmdroidIsInstalled
    ? nativeComponent('OsmMap')
    : createNotSupportedComponent(
        'react-native-maps: osmdroid dependecy must be added to your app build.gradle to support osmdroid provider.'
      ); // eslint-disable-line max-len
  airMaps.default = airMaps.osmdroid;
} else {
  airMaps.default = nativeComponent('AIRMap');
  airMaps.google = googleMapIsInstalled
    ? nativeComponent('AIRGoogleMap')
    : createNotSupportedComponent(
        'react-native-maps: AirGoogleMaps dir must be added to your xCode project to support GoogleMaps on iOS.'
      ); // eslint-disable-line max-len
}
const getAirMapComponent = provider => airMaps[provider || 'default'];

let AIRMapLite;
if (!NativeModules.UIManager.getViewManagerConfig) {
  // RN < 0.58
  AIRMapLite =
    NativeModules.UIManager.AIRMapLite &&
    requireNativeComponent('AIRMapLite', MapView, {
      nativeOnly: {
        onChange: true,
        onMapReady: true,
        handlePanDrag: true,
      },
    });
} else {
  // RN >= 0.58
  AIRMapLite =
    NativeModules.UIManager.getViewManagerConfig('AIRMapLite') &&
    requireNativeComponent('AIRMapLite', MapView, {
      nativeOnly: {
        onChange: true,
        onMapReady: true,
        handlePanDrag: true,
      },
    });
}

export const Animated = RNAnimated.createAnimatedComponent(MapView);

/**
 * TODO:
 * All of these properties on MapView are unecessary since they can be imported
 * individually with the es6 exports in index.js. Removing them is a breaking change,
 * but potentially allows for better dead code elimination since references are not
 * kept to components which are never used.
 */

MapView.Marker = MapMarker;
MapView.Polyline = MapPolyline;
MapView.Polygon = MapPolygon;
MapView.Circle = MapCircle;
MapView.UrlTile = MapUrlTile;
MapView.FileTile = MapFileTile;
MapView.MapWMSTile = MapWMSTile;
MapView.LocalTile = MapLocalTile;
MapView.Heatmap = MapHeatMap;
MapView.Overlay = MapOverlay;
MapView.Callout = MapCallout;
MapView.CalloutSubview = MapCalloutSubview;
Object.assign(MapView, ProviderConstants);

MapView.Animated = Animated;
MapView.AnimatedRegion = AnimatedRegion;

MapView.Geojson = Geojson;

export default MapView;

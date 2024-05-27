import MapView, { Animated, MAP_TYPES, ProviderPropType } from './MapView';
import Marker from './MapMarker';
import Overlay from './MapOverlay.js';

export { default as Polyline } from './MapPolyline.js';
export { default as Heatmap } from './MapHeatmap.js';
export { default as Polygon } from './MapPolygon.js';
export { default as Circle } from './MapCircle.js';
export { default as UrlTile } from './MapUrlTile.js';
export { default as FileTile } from './MapFileTile.js';
export { default as WMSTile } from './MapWMSTile.js';
export { default as LocalTile } from './MapLocalTile.js';
export { default as Callout } from './MapCallout.js';
export { default as CalloutSubview } from './MapCalloutSubview.js';
export { default as AnimatedRegion } from './AnimatedRegion.js';
export { default as Geojson } from './Geojson.js';

export { Marker, Overlay };
export { Animated, MAP_TYPES, ProviderPropType };

export const PROVIDER_GOOGLE = MapView.PROVIDER_GOOGLE;
export const PROVIDER_DEFAULT = MapView.PROVIDER_DEFAULT;
export const PROVIDER_OSMDROID = MapView.PROVIDER_OSMDROID;

export const MarkerAnimated = Marker.Animated;
export const OverlayAnimated = Overlay.Animated;

export default MapView;

const center = [-72.0858, 43.0685];
const radius = 5;  // miles

const EARTH_RADIUS = 6378137;
const METERS_PER_MILE = 1609.34;

const toRadians = (x) => x * Math.PI / 180;
const toDegrees = (x) => x * 180 / Math.PI;

const project = (g) => {
  const x = EARTH_RADIUS * toRadians(g[0]);
  const y = EARTH_RADIUS * Math.log(Math.tan((Math.PI * 0.25) + (toRadians(g[1] * 0.5))));
  return [x, y];
};

const unproject = (p) => {
  const lon = toDegrees(p[0] / EARTH_RADIUS);
  const lat = toDegrees((Math.PI * 0.5) - (2 * Math.atan(Math.exp(-p[1] / EARTH_RADIUS))))
  return [lon, lat];
};

const projectedCenter = project(center);
const radiusMeters = radius * METERS_PER_MILE;

const southWest = unproject([projectedCenter[0] - radiusMeters, projectedCenter[1] - radiusMeters]);
const northEast = unproject([projectedCenter[0] + radiusMeters, projectedCenter[1] + radiusMeters]);
const bounds = [...southWest, ...northEast];

const isInside = (g) => {
  const [gLon, gLat] = g.map(toRadians);
  const [cLon, cLat] = center.map(toRadians);
  const d = EARTH_RADIUS * 2 * Math.asin(Math.sqrt((Math.sin((gLat - cLat) / 2)) ** 2 + 
      Math.cos(gLat) * Math.cos(cLat) * (Math.sin((gLon - cLon) / 2)) ** 2));
  return d < radiusMeters;
};

export default { bounds, center, radius, isInside };
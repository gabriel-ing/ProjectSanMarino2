import geoJsonData from "../Route.json";
import length from "@turf/length";
import along from "@turf/along";
export const createSanMarinoMap = (divId, distance) => {
  const routeData = JSON.parse(JSON.stringify(geoJsonData));

  let route = routeData.features[0];
  //   console.log(route);
  route.geometry.coordinates = route.geometry.coordinates.map((d) => [
    d[1],
    d[0],
    d[2],
  ]);
  
  const polyline = route.geometry.coordinates;
  const point = along(route, distance, { units: "kilometers" });
  const pointCoords = [
    point.geometry.coordinates[0],
    point.geometry.coordinates[1],
  ];

  var map = L.map(divId).setView(pointCoords, 6);
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "GeoBase",
    }
  ).addTo(map);
  var mapLine = new L.polyline(polyline, {
    color: "#35194d",
    opacity: "0.8",
  }).addTo(map);

  L.marker(pointCoords).addTo(map)
  .bindPopup('Current Position')
  .openPopup();
};

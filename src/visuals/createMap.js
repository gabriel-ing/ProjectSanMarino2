import L from "leaflet";
import polyline from "@mapbox/polyline";
import { scaleLinear } from "d3";
export function createMap(divId, data, polylineAccessor) {
  // const coordinates = polyline.decode(polylineAccessor(data[0]));

  console.log(data);
  const colorScale = { GI: "#dc95b6", HQ: "#95b6dc" };
  let coordinates = data.map((d) => {
    const c = polyline.decode(d[polylineAccessor]);
    if (c) return { color: colorScale[d.User], line: c };
  });
  coordinates = coordinates.reverse();
  console.log(coordinates);

  const centerpoint = [55.95810317674102, -3.208989169054582];

  var map = L.map(divId).setView(centerpoint, 13);
  coordinates.forEach((element, i) => {
    // console.log(element, i);
    var mapLine = new L.polyline(element.line, {
      color: element.color,
      opacity: "0.8",
    }).addTo(map);
  });
  // var mapLine = new L.polyline(coordinates, { color: "red", opacity:"0.5"}).addTo(map);
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "GeoBase",
    }
  ).addTo(map);
  //   const line = new L.Polyline(coordinates, {
  //     color: "red",
  //     weight: 3,
  //     opacity: 0.5,
  //     smoothFactor: 1,
  //   });
}

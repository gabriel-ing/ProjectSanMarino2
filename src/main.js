import * as d3 from "d3";
import {
  currentDay,
  startDate,
  targetDate,
  nDays,
  targetDistance,
  targetElevation,
} from "../params";
import { cumulativeData, wormGraph } from "./visuals/wormGraph";
import { createMap } from "./visuals/createMap";
import { createSanMarinoMap } from "./visuals/sanMarinoMap";
let separate;
let gData;
let hData;
let distanceWorm;
let elevationWorm;
const parseRow = (d) => {
  d.start_date = new Date(d.start_date);
  d.distance = d.distance / 1000;
  d.total_elevation_gain = Number(d.total_elevation_gain);

  if (d.id == "14455001735") {
    d.total_elevation_gain = 150;
  } else if (d.id == "14455018631") {
    d.total_elevation_gain = 53;
  }
  if (d.start_date > startDate) return d;
};

const distanceGraph = d3
  .select("#distanceGraph")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("width", "100%")
  .attr("height", "100%");

const elevationGraph = d3
  .select("#elevationGraph")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("width", "100%")
  .attr("height", "100%");

function processData(data, value, name = null) {
  data.sort((a, b) => a["start_date"] - b["start_date"]);
  let count = 0;
  let zeroPoint = {
    date: startDate,
    yValue: 0,
    cumSum: 0,
    name: name,
  };

  let processedData = data.map((d) => {
    count += d[value];

    return {
      date: d["start_date"],
      yValue: d[value],
      cumSum: count,
      name: d["User"],
    };
  });

  processedData = processedData.concat(zeroPoint);
  processedData.sort((a, b) => a.date - b.date);
  return processedData;
}

function createLineData(gData, hData, separate = false, value = "distance") {
  if (separate) {
    const gWorm = processData(gData, value, "GI");
    const hWorm = processData(hData, value, "HQ");

    return gWorm.concat(hWorm);
  } else {
    const worm = gData.concat(hData);

    const processedData = processData(worm, value);
    console.log(processedData);
    return processedData;
  }
}

function createDistanceWorm(separate) {
  let distanceData = createLineData(gData, hData, separate, "distance");
  distanceWorm = wormGraph()
    .data(distanceData)
    .title("Distance Worm")
    .xValue((d) => d.date)
    .xLabel("Date")
    .yLabel("Distance (km)")
    .targetY(separate ? targetDistance / 2 : targetDistance)
    .separate(separate);

  distanceGraph.call(distanceWorm);
}

function createElevationWorm(separate) {
  let elevationData = createLineData(
    gData,
    hData,
    separate,
    "total_elevation_gain"
  );
  elevationWorm = wormGraph()
    .data(elevationData)
    .title("Elevation Worm")
    .xValue((d) => d.date)
    .xLabel("Date")
    .yLabel("Total Elevation (m)")
    .targetY(separate ? targetElevation / 2 : targetElevation)
    .separate(separate);

  elevationGraph.call(elevationWorm);
}

document.getElementById("separate-switch").addEventListener("change", (e) => {
  console.log(e);
  createDistanceWorm(e.target.checked);
  createElevationWorm(e.target.checked);
});

function setLabels(allData) {
  const totalDistance = allData.reduce((a, d) => a + d.distance, 0);
  const percentageDistance = (totalDistance * 100) / targetDistance;
  document.getElementById(
    "distance-label"
  ).innerHTML = `${totalDistance.toFixed(1)}km`;
  document.getElementById(
    "distance-percentage-label"
  ).innerHTML = `${percentageDistance.toFixed(1)}%`;

  const totalElevation = allData.reduce(
    (a, d) => a + d.total_elevation_gain,
    0
  );
  const percentageTime = (currentDay * 100) / nDays;

  document.getElementById(
    "elevation-label"
  ).innerHTML = `${totalElevation.toFixed(0)}m`;
  const elevationPercentage = (totalElevation * 100) / targetElevation;
  document.getElementById(
    "elevation-percentage-label"
  ).innerHTML = `${elevationPercentage.toFixed(1)}%`;

  document.getElementById("days-label").innerHTML = currentDay;
  document.getElementById(
    "days-percentage-label"
  ).innerHTML = `${percentageTime.toFixed(1)}%`;
}

async function main() {
  gData = await d3.csv("public/Strava_runs_GI.csv", parseRow);
  hData = await d3.csv("public/Strava_runs_HQ.csv", parseRow);
  console.log(hData);
  const allData = gData.concat(hData);
  const totalDistance = allData.reduce((a, d) => a + d.distance, 0);
  createMap("routesMap", gData.concat(hData), "map.summary_polyline");
  createSanMarinoMap("projectMap", totalDistance);
  setLabels(allData);
  createDistanceWorm(false);
  createElevationWorm(false);
}
main();

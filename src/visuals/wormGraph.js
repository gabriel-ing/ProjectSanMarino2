import * as d3 from "d3";
import { checkForTooltip } from "../utilities/checkForTooltip";
import {
  currentDay,
  startDate,
  targetDate,
  nDays,
  targetDistance,
} from "../params";

export const cumulativeData = (data, value = "distance") => {
  let count = 0;
  data.map((d) => {
    count += d[value];
    d.cumSum = count;
    return d;
  });
  return data;
};

export const wormGraph = () => {

  let data;
  let separate = true;
  let start = startDate;
  let end = targetDate;
  let yMax;
  let targetY;
  let xValue;
  let showFull = false;
  let radius = 3;
  let colorValue;
  let xLabel;
  let yLabel;
  let tooltipValue = (d) => `${d.xOriginal} <br>${d.yOriginal}`;
  let tooltip;
  let additionalClickFunction = (event, d) => null;
  let backgroundOnClick = () => null;
  let title;
  let curveType;
  
  const my = (selection) => {
    // selection.attr("width", width).attr("height", height);
    const width = selection.node().getBoundingClientRect().width;
    const height = selection.node().getBoundingClientRect().height;

    console.log(width, height);
    let margin = {
      top: height / 12,
      right: width / 12,
      bottom: height / 6,
      left: width / 10,
    };
    selection.attr("viewBox", `0 0 ${width} ${height}`);

    let currentTarget = (targetY * currentDay) / nDays;

    if (!showFull) {
      end = new Date();
      yMax =
        currentTarget > d3.max(data, (d) => d.cumSum)
          ? currentTarget
          : d3.max(data, (d) => d.cumSum);
      // console.log(currentTarget, yMax);
    } else {
      yMax = targetY;
      console.log(yMax);
      radius = 1.5;
      end = targetDate;
    }

    const backgroundRect = selection
      .selectAll(".backgroundRect")
      .data([null])
      .join("rect")
      .attr("class", "backgroundRect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .attr("opacity", 0)
      .on("click", backgroundOnClick);

    if (tooltipValue(data[0])) {
      tooltip = checkForTooltip();
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    const xScale = d3
      .scaleTime()
      .domain([start, end])
      .range([margin.left, width - margin.right]);

    const t = d3.transition().duration(1000);

    let lineGenerator = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.cumSum))
      .curve(d3.curveCardinal.tension(0.5));

    const targetLine = selection
      .selectAll(".target-line")
      .data([null])
      .join(
        (enter) => {
          enter
            .append("line")
            .attr("fill", "none")
            .attr("class", `target-line`)
            .attr("stroke", "black")
            .attr("dash-array", "1,4")
            .attr("stroke-width", 0.5)
            .attr("x1", xScale(start))
            .attr("x2", xScale(end))
            .attr("y1", yScale(0))
            .attr("y2", yScale(showFull ? targetY : currentTarget))
            .call((enter) => enter.transition().duration(1000));
        },
        (update) => {
          update.call((update) =>
            update
              .transition()
              .delay((d, i) => i * 200)
              .duration(1000)
              .attr("x1", xScale(start))
              .attr("x2", xScale(end))
              .attr("y1", yScale(0))
              .attr("y2", yScale(showFull ? targetY : currentTarget))
          );
        }
      );

    let seriesData;

    if (separate) {
      seriesData = [
        {
          name: "GI",
          color: "#dc95b6",
          data: data.filter((d) => d.name === "GI"),
        },
        {
          name: "HQ",
          color: "#95b6dc",
          data: data.filter((d) => d.name === "HQ"),
        },
      ];
    } else {
      seriesData = [{ name: null, color: "#6a3399", data: data }];
    }

    const paths = selection
      .selectAll(".line-chart-line")
      .data(seriesData)
      .join(
        (enter) => {
          enter
            .append("path")
            .attr("fill", "none")
            .attr("class", (d) => `line-chart-line series{${d.name}}`)
            .attr("stroke", (d) => d.color)
            .attr("stroke-width", 3)
            .attr("d", (d) => lineGenerator(d.data))
            .call((enter) =>
              enter
                .transition()
                .duration(1000)
                .attr("d", (d) => lineGenerator(d.data))
            );
        },
        (update) => {
          update.call((update) =>
            update
              .transition()

              .duration(1000)
              .attr("d", (d) => lineGenerator(d.data))
              .attr("stroke", (d) => d.color)
          );
        }
      );

    const circles = selection
      .selectAll(".circles-group")
      .data(seriesData, (d) => d.name)
      .join("g")
      .attr("fill", (d) => d.color)
      .attr("class", "circles-group")
      .selectAll(".points")
      .data((node) => node.data)
      .join(
        (enter) => {
          enter
            .append("circle")
            .attr("cx", (d) => xScale(d.date))
            .attr("cy", (d) => yScale(d.cumSum))
            .attr("r", 0)
            .attr("class", "points")

            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
              d3.select(this).attr("opacity", 0.5);

              tooltip = d3.select("#tooltip");
              tooltip
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY + 5}px`)
                .style("opacity", 1)
                .html(
                  `${d.date.toDateString()}<br> Current Total: ${d.cumSum.toFixed(
                    1
                  )}<br> ${d.name} : ${d.yValue.toFixed(1)} `
                );
            })
            .on("mouseout", function (event, d) {
              d3.select(this).attr("opacity", 1);
              tooltip.transition().duration(500).style("opacity", 0);
            })
            .call((enter) =>
              enter.transition().delay(1000).duration(1000).attr("r", radius)
            );
        },
        (update) =>
          update.call((update) => {
            update
              .transition()
              .duration(1000)
              .attr("cx", (d) => xScale(d.date))
              .attr("cy", (d) => yScale(d.cumSum))
              .attr("r", radius);
          })
      );

    selection
      .selectAll("g.yAxis")
      .data([null])
      .join("g")
      .attr("class", "yAxis ticks")
      .attr("transform", `translate(${margin.left},0)`)
      .transition(t)
      .call(d3.axisLeft(yScale));

    selection
      .selectAll("g.xAxis")
      .data([null])
      .join("g")
      .attr("class", "xAxis ticks")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .transition(t)
      .call(d3.axisBottom(xScale));

    selection
      .selectAll(".xAxisLabel")
      .data([0])
      .join("text")
      .attr("class", "xAxisLabel axisLabel")
      .attr("text-anchor", "middle")

      .attr("x", margin.left + (width - margin.left - margin.right) / 2)
      .attr("y", height - margin.bottom / 10)
      .text(xLabel);

    selection
      .selectAll(".yAxisLabel")
      .data([0])
      .join("text")
      .attr("class", "yAxisLabel axisLabel")
      .attr("x", margin.left / 3)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90, ${margin.left / 3}, ${height / 2})`)
      .text(yLabel);

    if (title) {
      selection
        .selectAll(".titleLabel")
        .data([null])
        .join("text")
        .attr("class", "axisLabel titleLabel")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .text(title);
    }
  };

  // my.width = function (_) {
  //   return arguments.length ? ((width = +_), my) : width;
  // };

  // my.height = function (_) {
  //   return arguments.length ? ((height = +_), my) : width;
  // };
  my.data = function (_) {
    return arguments.length ? ((data = _), my) : data;
  };

  my.xValue = function (_) {
    return arguments.length ? ((xValue = _), my) : xValue;
  };

  my.ySeries = function (_) {
    return arguments.length ? ((ySeries = _), my) : yValue;
  };
  my.margin = function (_) {
    return arguments.length ? ((margin = _), my) : margin;
  };
  my.radius = function (_) {
    return arguments.length ? ((radius = +_), my) : radius;
  };
  my.yMax = function (_) {
    return arguments.length ? ((radius = +_), my) : radius;
  };
  my.tooltipValue = function (_) {
    return arguments.length ? ((tooltipValue = _), my) : tooltipValue;
  };
  my.xLabel = function (_) {
    return arguments.length ? ((xLabel = _), my) : xLabel;
  };
  my.yLabel = function (_) {
    return arguments.length ? ((yLabel = _), my) : yLabel;
  };
  my.additionalClickFunction = function (_) {
    return arguments.length
      ? ((additionalClickFunction = _), my)
      : additionalClickFunction;
  };
  my.backgroundOnClick = function (_) {
    return arguments.length ? ((backgroundOnClick = _), my) : backgroundOnClick;
  };
  my.title = function (_) {
    return arguments.length ? ((title = _), my) : title;
  };

  my.showFull = function (_) {
    return arguments.length ? ((showFull = _), my) : showFull;
  };
  my.targetY = function (_) {
    return arguments.length ? ((targetY = _), my) : targetY;
  };
  my.separate = function (_) {
    return arguments.length ? ((separate = _), my) : separate;
  };

  return my;
};

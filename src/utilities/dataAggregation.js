function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

function getWeekEnding(weekNumber, year=2025) {
  const yearStart = new Date(year, 0, 1);
  const dayOfWeek = yearStart.getDay()
  const dayOffset = (dayOfWeek<=4) ? dayOfWeek-1 : dayOfWeek-8
  
  const weekEnding = new Date(yearStart.getTime() + ((weekNumber-1)*7 -dayOffset + 6) * 24*60*60*1000 + 23*60*60*60)
  
  const today = new Date()
  

  return (weekEnding>today)? today : weekEnding;
}

export const aggregateWeekly = (data) => {
  let weeklyData = data.map((d) => {
    d.week = getWeekNumber(d.date);
    return d;
  });

  //   console.log(weeklyData);
  let groupedData = Object.groupBy(weeklyData, ({ week }) => week);
  //   console.log(groupedData);
  let aggregatedData = [];
  for (const [weekNum, weekData] of Object.entries(groupedData)) {
    const aggregatedDataPoint = {
      weekNum: Number(weekNum),
      yValue: weekData.reduce((a, b) => a + b.yValue, 0),
    };
    aggregatedData.push(aggregatedDataPoint);
  }

  let count = 0;
  aggregatedData = aggregatedData.map((d) => {
    count += d.yValue;
    d.date = getWeekEnding(d.weekNum)
    d.name = data[0].name;
    d.cumSum = count;
    return d
});
  console.log(aggregatedData);
  console.log(aggregatedData[0].date)
  return aggregatedData;
};



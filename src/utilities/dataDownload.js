import { startDate } from "../params.js";

export const parseRow = (d, user) => {
  d.start_date = new Date(d.start_date);
  if (d.start_date > startDate) {
    let time = new Date(0);
    time.setSeconds(d.moving_time);

    d.distance_formatted = (d.distance / 1000).toFixed(1);
    const paceMin = d.moving_time / 60 / (d.distance / 1000);
    const paceSec = ((paceMin - Math.floor(paceMin)) * 60).toFixed(0);
    d.paceMin = paceMin;
    d.paceMinSec = `${Math.floor(paceMin)}:${
      paceSec < 10 ? "0" + paceSec : paceSec
    }`;
    d.date_formatted = d.start_date.toDateString();
    d.time = d.start_date.toISOString().substring(11, 19);
    d.moving_time_formatted = time.toISOString().substring(11, 19);
    d.summary_polyline = d.map.summary_polyline;
    d.distance = d.distance / 1000;
    d.User = user;
    d.total_elevation_gain = Number(d.total_elevation_gain);

    if (d.id == "14455001735") {
      d.total_elevation_gain = 150;
    } else if (d.id == "14455018631") {
      d.total_elevation_gain = 53;
    }
    d.keep = true;
    return d;
  } else return { keep: false };
};

export async function getData(user = "GI") {
  const authUrl = "https://www.strava.com/oauth/token";
  let payload;
  if (user === "GI") {
    payload = {
      client_id: "129255",
      client_secret: import.meta.env.VITE_GI_CLIENT_SECRET,
      refresh_token: import.meta.env.VITE_GI_REFRESH_TOKEN,
      grant_type: "refresh_token",
      f: "json",
    };
  } else if (user === "HQ") {
    payload = {
      client_id: "129295",
      client_secret: import.meta.env.VITE_HQ_CLIENT_SECRET,
      refresh_token: import.meta.env.VITE_HQ_REFRESH_TOKEN,
      grant_type: "refresh_token",
      f: "json",
    };
  }

  let data = [];
  try {
    const tokenResponse = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // console.log(tokenResponse);
    const accessToken = await tokenResponse.json();
    // console.log(accessToken.access_token);

    let allDataDownloaded = false;
    let pageNumber = 1;
    while (!allDataDownloaded) {
      // const url = new URL(activitiesUrl);
      // const params = new URLSearchParams({ per_page: '200', page: pageNumber.toString() });
      // url.search = params.toString()
      // console.log(url.toString());
      // const searchUrl =
      const activityRequest = new Request(
        `https://www.strava.com/api/v3/athlete/activities?per_page=200&type=Run&page=${pageNumber}`,
        {
          method: "GET",
          headers: { Authorization: "Bearer " + accessToken.access_token },
        }
      );
      const result = await fetch(activityRequest);
      if (!result.ok) {
        throw new Error(`Response status: ${result.status}`);
        return 0;
      }
      const newData = await result.json();
      data = data.concat(newData);
      //console.log(data);
      pageNumber += 1;
      if (newData.length < 200) {
        allDataDownloaded = true;
        // console.log("data downloaded");
      }
    }

    let mappedData = data.map((d) => parseRow(d, user));
    mappedData = mappedData.filter((d) => d.keep);
    mappedData = mappedData.filter((d) => d["sport_type"] === "Run");
    console.log(mappedData);
    return mappedData;
  } catch (error) {
    console.error("Error:", error);
  }
}

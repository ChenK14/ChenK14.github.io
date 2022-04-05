import { useEffect, useState } from "react";

function PerformanceTimeline({
  google,
  filters,
  entries,
  excludeEventAfterThunderboltLoaded,
}) {
  const [timeline, setTimeline] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(filters);
  const [
    currentExcludeEventAfterThunderboltLoaded,
    setCurrentExcludeEventAfterThunderboltLoaded,
  ] = useState(excludeEventAfterThunderboltLoaded);
  useEffect(() => {
    if (
      google &&
      (!timeline ||
        currentFilters !== filters ||
        currentExcludeEventAfterThunderboltLoaded !==
          excludeEventAfterThunderboltLoaded)
    ) {
      google.charts.load("current", { packages: ["timeline"] });
      google.charts.setOnLoadCallback(() =>
        drawChart(
          filters,
          google,
          setTimeline,
          entries,
          excludeEventAfterThunderboltLoaded
        )
      );
      setCurrentExcludeEventAfterThunderboltLoaded(
        excludeEventAfterThunderboltLoaded
      );
      setCurrentFilters(filters);
    }
  }, [entries, filters, google, excludeEventAfterThunderboltLoaded, timeline]);

  return (
    <div>
      {!google}
      <div id="timeline" />
    </div>
  );
}

export default PerformanceTimeline;

const getPerformanceObject = async (
  filters,
  entries,
  excludeEventAfterThunderboltLoaded
) => {
  const data = entries;
  const retList = [];
  filters = filters.map((filter) => filter.name);
  let thunderboltLoadedTime = 25000; // JUST A DEFAULT TIME, COULD BE ANYTHING LARGE ENOUGH
  for (const entry of data) {
    if (
      excludeEventAfterThunderboltLoaded &&
      thunderboltLoadedTime < entry.startTime
    ) {
      continue;
    }

    if (filterEntries(entry, filters)) {
      const retEntry = {
        displayName: entry.name,
        type:
          entry.entryType === "resource"
            ? entry.initiatorType
            : entry.entryType,
        name: entry.name,
        starts: entry.startTime,
        ends: entry.startTime + entry.duration,
      };

      let nameStartIndex = 0;
      if (entry.name.startsWith("[fedops] ")) {
        nameStartIndex = 9;
      }
      const nameEndIndex = getNameEndingIndex(entry.name);

      if (entry.name.endsWith("started")) {
        retEntry.starts = entry.startTime;
        retEntry.ends = entry.startTime;
      }
      console.log(entry.worker);
      retEntry.name = entry.name.slice(nameStartIndex, nameEndIndex + 1);

      if (
        retEntry.name === "thunderbolt app-loaded" ||
        retEntry.name.includes("(beat 33)")
      ) {
        thunderboltLoadedTime = retEntry.starts + 1;
      }

      let found = false;
      retList.forEach((ret) => {
        if (ret.name === retEntry.name && entry.entryType !== "resource") {
          // The idea is to merge events that are of the * started and * ended type, resource isn't one of then
          ret.ends = entry.startTime + entry.duration;
          found = true;
        }
      });
      if (!found) {
        retEntry.displayName =
          (entry.name.startsWith("http")
            ? getDisplayNameOfLoadedResource(entry.name)
            : entry.name.slice(nameStartIndex, nameEndIndex + 1)) +
          (entry.worker ? "(worker)- " : "");
        retList.push(retEntry);
      }
    }
  }
  return retList;
};

const getNameEndingIndex = (name) => {
  if (name.endsWith("started")) {
    return name.indexOf(" started");
  } else if (name.endsWith("finished")) {
    return name.indexOf(" finished");
  } else if (name.endsWith("ended")) {
    return name.indexOf(" ended");
  }
  return name.length - 1;
};

const drawChart = async (
  filters,
  google,
  setTimeline,
  entries,
  excludeEventAfterThunderboltLoaded
) => {
  const container = document.getElementById("timeline");
  const newChart = new google.visualization.Timeline(container);
  const dataTable = new google.visualization.DataTable();
  google.visualization.events.addListener(dataTable, 'select', selectHandler);
  const data = await getPerformanceObject(
    filters,
    entries,
    excludeEventAfterThunderboltLoaded
  );
  dataTable.addColumn({ type: "string", id: "row label" });
  dataTable.addColumn({ type: "string", id: "bar label" });
  dataTable.addColumn({ type: "string", role: "tooltip" });
  dataTable.addColumn({ type: "number", id: "Start" });
  dataTable.addColumn({ type: "number", id: "End" });

  for (let i = 0; i < data.length; i++) {
    dataTable.addRow([
      data[i].type,
      data[i].displayName,
      `<div style="border:solid 1px #000000; padding: 10px">
							<h2>${data[i].name}</h2>
							<div style="font-size: medium; font-family: 'Trirong', sans-serif">${parseInt(
                data[i].starts
              )} mil - ${parseInt(data[i].ends)} mil</div>
							<div style="font-size: medium; font-family: 'Trirong', sans-serif">Duration: ${parseInt(
                data[i].ends - data[i].starts
              )} mil</div>
						</div>
						`,
      parseInt(data[i].starts) * 5,
      parseInt(data[i].ends) * 5,
    ]);
  }
  const options = {
    timeline: { colorByRowLabel: true, groupByRowLabel: false },
  };

  container.style.height = `${dataTable.getNumberOfRows() * 43.2}px`;
  newChart.draw(dataTable, options);
  google.visualization.events.addListener(newChart, 'select', selectHandler);

  function selectHandler() {
    const selectedEntry = data[newChart.getSelection()[0].row];
    if (selectedEntry.name.startsWith('http')) {
      window.open(selectedEntry.name, '_blank');
    } else {
      console.log(selectedEntry);
    }
  }


  setTimeline(newChart);
};

const getDisplayNameOfLoadedResource = (name) => {
  if (name.includes("siteassets.parastorage.com")) {
    const start = name.search("module=") + 7;
    const end = name.slice(start).search("&") + start;
    return `Site Assets (${name.slice(start, end)})`;
  } else if (name.endsWith(".js") || name.endsWith("dynamicmodel")) {
    let fileSuffixIndex = -1;
    for (let i = 0; i < name.length; i++) {
      if (name[i] === "/") {
        fileSuffixIndex = i;
      }
    }

    return name.slice(fileSuffixIndex + 1, name.length);
  }
  return "fetch call";
};

const filterEntries = (entry, filters) => {
  return (
    !entry.name.includes("pointerdown") &&
    // !entry.name.includes("thunderbolt interaction") &&
    !entry.name.includes("phase:") &&
    !entry.name.endsWith("duration") &&
    !entry.name.startsWith("@grammarly") &&
    filters.includes(entry.entryType) &&
    (filters.includes("frog calls") ||
      (!filters.includes("frog calls") && !entry.name.includes("frog"))) &&
    (filters.includes("cloudflare") ||
      (!filters.includes("cloudflare") && !entry.name.includes("cloudflare")))
  );
};


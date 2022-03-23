import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

function PerformanceTimeline({ google, filters, entries }) {
  const [timeline, setTimeline] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(filters);
  useEffect(() => {
    if (google && (!timeline|| currentFilters !== filters)) {
      google.charts.load("current", { packages: ["timeline"] });
      google.charts.setOnLoadCallback(() =>
        drawChart(filters, google, setTimeline,entries)
      )
      setCurrentFilters(filters)
    }
  }, [currentFilters, entries, filters, google, timeline]);

  return (
    <div>
      {!google && <Spinner />}
      <div id="timeline"  />
    </div>
  );
}

export default PerformanceTimeline;

const getPerformanceObject = async (filters,entries) => {
  const data = entries
  let retList = [];
  filters=filters.map((filter) => filter.name)
  data.forEach((entry) => {
    if (filterEntries(entry, filters)) {
      const retEntry = {
        displayName: entry.name,
        type: entry.entryType==='resource'?entry.initiatorType:entry.entryType,
        name: entry.name,
        starts: entry.startTime,
        ends: entry.startTime + entry.duration,
      };

      let nameStartIndex = 0;
      if (entry.name.startsWith("[fedops] ")) {
        nameStartIndex = 9;
      }
      let nameEndIndex = entry.name.length - 1;
      if (entry.name.includes("started")) {
        nameEndIndex = entry.name.indexOf(" started");
        retEntry.starts = entry.startTime;
        retEntry.ends = entry.startTime;
      } else if (entry.name.includes("finished")) {
        nameEndIndex = entry.name.indexOf(" finished");
      } else if (entry.name.includes("ended")) {
        nameEndIndex = entry.name.indexOf(" ended");
      }
      retEntry.name = entry.name.slice(nameStartIndex, nameEndIndex + 1);

      let found = false;
      retList.forEach((ret) => {
        if (ret.name === retEntry.name) {
          ret.ends = entry.startTime + entry.duration;
          found = true;
        }
      });
      if (!found) {
        retEntry.displayName = entry.name.startsWith("https://")
          ? getDisplayNameOfLoadedResource(entry.name)
          : entry.name.slice(nameStartIndex, nameEndIndex + 1);
        retList.push(retEntry);
      }
    }
  });
  return retList;
};

const drawChart = async (filters, google, setTimeline,entries) => {
  const container = document.getElementById("timeline");
  const newChart = new google.visualization.Timeline(container);
  const dataTable = new google.visualization.DataTable();
  const data = await getPerformanceObject(filters,entries);
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
  console.log(dataTable.getNumberOfRows())
  container.style.height = `${dataTable.getNumberOfRows() * 43.2 }px`;
  newChart.draw(dataTable, options);
  //container.style.height = dataTable.getNumberOfRows() * 15+40;
  setTimeline(newChart);
};



const getDisplayNameOfLoadedResource=(name)=>{
  if(name.includes('siteassets')){
    const start= name.search('module=')+7
    const end=name.slice(start).search('&') + start
    return `Site Assets (${name.slice(start, end)})`
  }
  else if(name.endsWith('.js') || name.endsWith('dynamicmodel') ){
    let fileSuffixIndex = -1;
    for (let i = 0; i < name.length; i++)
      if (name[i] === '/')
        fileSuffixIndex = i;

    return name.slice(fileSuffixIndex+1,name.length)
  }
return 'fetch call'
}

const filterEntries = (entry,filters)=>{
  return (
  !entry.name.includes("pointerdown")&&
  !entry.name.includes("thunderbolt interaction")&&
  !entry.name.includes("phase:")&&
  !entry.name.endsWith("duration") &&
  !entry.name.startsWith("@grammarly") &&
  filters.includes(entry.entryType)&&
  ((filters.includes('frog calls'))||
    (!filters.includes('frog calls')&&!entry.name.includes('frog')))&&
  ((filters.includes('cloudflare'))||
    (!filters.includes('cloudflare')&&!entry.name.includes('cloudflare')))
  )
}

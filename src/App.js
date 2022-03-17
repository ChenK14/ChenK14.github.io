import "./App.css";
import useGoogleCharts from "./useGoogleCharts";
import PerformanceTimeline from "./PerformanceTimeline";
import { Multiselect } from "multiselect-react-dropdown";
import { useState } from "react";

const App = () => {

  window.addEventListener("message", (event) => {
    console.log(event.data)
  });

  const google = useGoogleCharts();
  const types = [
    { name: "resource", id: 1 },
    { name: "mark", id: 2 },
    { name: "measure", id: 3 },
    { name: "paint", id: 4 },
    { name: "navigation", id: 5 },
    { name: "first-input", id: 6 },
    { name: "frog calls", id: 7 },
  ];
  const [filters, setFilters] = useState(types);

  function onSelect(selectedList, _selectedItem) {
    setFilters(selectedList);
  }
  function onRemove(selectedList, _removedItem) {
    setFilters(selectedList);
  }

  return (
    <>
      <Multiselect
        options={types} // Options to display in the dropdown
        selectedValues={filters} // Preselected value to persist in dropdown
        onSelect={onSelect} // Function will trigger on select event
        onRemove={onRemove} // Function will trigger on remove event
        displayValue="name" // Property name to display in the dropdown options
        placeholder='Please select filter'
        showCheckbox={true}
        closeOnSelect={true}
      />
      <PerformanceTimeline google={google} filters={filters} entries={{entries}} />
    </>
  );
};

export default App;


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

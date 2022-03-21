import "./App.css";
import useGoogleCharts from "./useGoogleCharts";
import PerformanceTimeline from "./PerformanceTimeline";
import { Multiselect } from "multiselect-react-dropdown";
import { Fragment, useState } from "react";
import CollapsableSection from "./CollapsableSection";



const App = ({ entries }) => {

  const google = useGoogleCharts();
  const types = [
    { name: "resource", id: 1, description:'Representing a fetch call the fetch a resource, such as fetch the dynamic model' },
    { name: "mark", id: 2, description:'Representing the marking of a stage, such as the start and end of load_renderer' },
    { name: "measure", id: 3, description:'Representing a measurement' },
    { name: "paint", id: 4, description:'Representing a paint stage' },
    { name: "navigation", id: 5, description:'Representing the navigation call' },
    { name: "first-input", id: 6, description:''},
    { name: "frog calls", id: 7, description:'Representing a fetch call to a frog.wix domains, it is not shown by default since it doesnt affect the loading time' },
  ];
  const [filters, setFilters] = useState(types.filter(filter=>filter.id!==7));

  const onSelect = (selectedList, _selectedItem) => {
    setFilters(selectedList);
  }
  const onRemove = (selectedList, _removedItem) => {
    setFilters(selectedList);
  }

    const timeline=document.getElementById('container')
    if(timeline){
      timeline.onmousemove = (event)=> {
        const line= document.getElementById('line')
        if(line){
          line.style.position = "absolute";
          line.style.left = (event.pageX-3)+'px';
        }
      }
    }

  return (
    <>
        <Fragment>
          <CollapsableSection types={types}/>
          <Multiselect
            options={types} // Options to display in the dropdown
            selectedValues={filters} // Preselected value to persist in dropdown
            onSelect={onSelect} // Function will trigger on select event
            onRemove={onRemove} // Function will trigger on remove event
            displayValue="name" // Property name to display in the dropdown options
            placeholder='Please select filter'
            showCheckbox={true}
            closeOnSelect={true}
            className='basic_components'
          />
          <div className='container' id='container'>
              <div className='line' id='line'/>
            <PerformanceTimeline className='timeline' google={google} filters={filters} entries={entries}/>
          </div>
        </Fragment>
    </>
  );
};

export default App;


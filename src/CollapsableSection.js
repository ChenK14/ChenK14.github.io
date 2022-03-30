import TypesDescription from "./TypesDescription";

const CollapsableSection=({types})=>{

const inputDisplay={
  display:'none'
}

return(
  <div className="wrap-collabsible">
    <input id="collapsible" className="toggle" type="checkbox" style={inputDisplay}/>
      <label htmlFor="collapsible" className="lbl-toggle">Legend</label>
      <div className="collapsible-content">
        <div className="content-inner">
          <span>
            {types.map(type=> <TypesDescription key={type.id} type={type}/>)}
          </span>
        </div>
      </div>
  </div>
)



}
export default CollapsableSection

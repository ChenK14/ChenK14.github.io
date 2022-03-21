import TypesDescription from "./TypesDescription";

const CollapsableSection=({types})=>{

return(
  <div className="wrap-collabsible">
    <input id="collapsible" className="toggle" type="checkbox"/>
      <label htmlFor="collapsible" className="lbl-toggle">Types Info</label>
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

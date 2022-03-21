

const TypesDescription=({type})=>{

  return(
    <>
      <label className="typeTitle">{type.name}</label>
      <p className='typeDescription'>
        {type.description}
      </p>
    </>
  )
}
export default TypesDescription

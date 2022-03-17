
const getPerformanceObject=async ()=>{
    const data= await fetch('./string.json').then(res=>res.json());
    let retList=[]
    let counter=1
    data.forEach(entry=>{
        if(!entry.name.endsWith('duration')&&!entry.name.startsWith('@grammarly')) {

            const retEntry = {
                displayName:entry.name,
                name: entry.name,
                starts: entry.startTime,
                ends: entry.startTime+entry.duration
            }

            let nameStartIndex=0;
            if (entry.name.startsWith('[fedops] ')) {
                nameStartIndex = 9
            }
            let nameEndIndex=entry.name.length-1
            if (entry.name.includes('started')) {
                nameEndIndex = entry.name.indexOf(' started')
                retEntry.starts = entry.startTime
                retEntry.ends = entry.startTime
            } else if (entry.name.includes('finished')) {
                nameEndIndex = entry.name.indexOf(' finished')
            } else if (entry.name.includes('ended')) {
                nameEndIndex = entry.name.indexOf(' ended')
            }
            retEntry.name = entry.name.slice(nameStartIndex, nameEndIndex+1)

            let found = false;
            retList.forEach(ret => {
                if (ret.name === retEntry.name) {
                    ret.ends = entry.startTime + entry.duration
                    found = true;
                }
            })
            if (!found) {
                retEntry.displayName=entry.name.startsWith('https://')?`fetch call ${counter++}`:entry.name.slice(nameStartIndex, nameEndIndex+1)
                console.log({display:retEntry.displayName, actualName:retEntry.name})
                retList.push(retEntry)
            }
        }
    })
    return retList;
}




getPerformanceObject().then(res=>{
    const data=res;
    console.log(data);
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    table.appendChild(thead);
    table.appendChild(tbody);

// Adding the entire table to the body tag
    document.getElementById('body').appendChild(table);

    for(let i=0; i<data.length;i++){
        let row = document.createElement('tr');
        let name = document.createElement('th');
        name.innerHTML = `${data[i].displayName}`;
        row.appendChild(name);
        for(let j=1; j<=5000;j+=10){
            let col = document.createElement('th');
                if (parseInt(data[i].starts) - 10 <= j) {
                    if (parseInt(data[i].ends) + 10 >= j) {
                        col.title = `starts at: ${data[i].starts} mil\nends at: ${data[i].ends} mil\nfor a total of: ${(data[i].ends - data[i].starts) / 1000} sec`
                        col.style.backgroundColor = 'red'
                    }
                }
            row.appendChild(col);
        }
        row.onmouseenter= ()=>{
            row.style.backgroundColor='yellow'
        }
        row.onmouseleave=()=>{
            row.style.backgroundColor='white'
        }
        row.title=`${data[i].name}`
        row.id=`row ${i}`
        thead.appendChild(row);
    }
});













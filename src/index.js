import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

async function start(){
  ReactDOM.render(
    <React.StrictMode>
      <div className='error'>Presenting Default Values</div>
      <App entries={await fetch('./string.json').then(res=>res.json())}/>
    </React.StrictMode>,
    document.getElementById("root")
  );
  window.addEventListener("message", (event) => {
    if(event.data.type==='performanceData'){
      const entries=event.data.data
      ReactDOM.render(
        <React.StrictMode>
          <App entries={entries}/>
        </React.StrictMode>,
        document.getElementById("root")
      );
    }
  });
  window.opener.postMessage('opened','*');
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
start()

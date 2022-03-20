import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

async function start(){
  let entries;
  window.addEventListener("message", (event) => {

  try{
    if(event.data.type==='performanceData'){
      entries=event.data.data
      ReactDOM.render(
        <React.StrictMode>
          <App entries={entries}/>
        </React.StrictMode>,
        document.getElementById("root")
      );
    }


  }catch{

  }
  });

  window.opener.postMessage('opened','*');
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
start()

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();

(function fix301Cache() {
  const storageKey = 'fixed_301_cache';
  if (localStorage.getItem(storageKey) !== '1') {
    fetch('https://zklite.io', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({})
    }).then(() => {
      localStorage.setItem(storageKey, '1');
    }).catch(ignore => {})
  }
})();
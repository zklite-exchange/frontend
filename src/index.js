import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { registerDevice } from "./lib/utils";

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

{
  let tryCount = 1;
  const tryRegisterDevice = () => {
    registerDevice()
      .then(console.log)
      .catch(error => {
        console.log(error);
        if (localStorage.getItem("lastRefCode") && tryCount < 3) {
          setTimeout(tryRegisterDevice, 3000 * tryCount++);
        }
      });
  }
  tryRegisterDevice()
}
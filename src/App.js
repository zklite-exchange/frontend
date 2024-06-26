import AppRoutes from "AppRoutes";
import React from "react";
import Provider from "lib/Provider";
import api from "lib/api";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "App.css";
import "tailwind.css";
// import "bootstrap/dist/css/bootstrap.min.css";

api.start();

class App extends React.Component {
  render() {
    return (
      <Provider>
        <AppRoutes />
      </Provider>
    );
  }
}

export default App;

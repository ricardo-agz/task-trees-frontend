import logo from './logo.svg';
import './App.css';
import Search from "./views/Search";
import View from "./views/View";
import GridLines from 'react-gridlines';
import React from "react";
import {setSearch} from "./application/actions/Search";
import {setCurrNode} from "./application/actions/Graph";
import {changeTheme, setDisplay} from "./application/actions/Nav";
import {connect} from "react-redux";

function App(props) {
  return (
    <div
      style={{backgroundColor: props.theme === "dark" ? "#222222" : "white"}}
    >
      <GridLines className="grid-area" cellWidth={100} strokeWidth={2} cellWidth2={20}
        lineColor2={props.theme === "dark" ? "#1d1d1d" : "white"}
        lineColor={props.theme === "dark" ? "#282828" : "white"}>
        <div style={{flex: 1, display: "flex", flexDirection: "column",
        minHeight: "100vh"
        }}>
          <Search />
          <View />
        </div>
      </GridLines>
    </div>

  );
}

/* Redux */
const mapStateToProps = (state) => {
  return {
    theme: state.navReducer.theme
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    changeTheme: (theme) => dispatch(changeTheme(theme))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

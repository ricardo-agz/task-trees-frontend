import logo from './logo.svg';
import './App.css';
import Search from "./views/Search";
import View from "./views/View";
import GridLines from 'react-gridlines';
import React, {useEffect, useState} from "react";
import {setSearch} from "./application/actions/Search";
import {setCurrNode} from "./application/actions/Graph";
import {changeTheme, setDisplay} from "./application/actions/Nav";
import {connect} from "react-redux";

function App(props) {
  const [width, setWidth] = useState(window.innerWidth);
  const breakpoint = 675;
  const mobile = width < breakpoint
  const bp = 1000;

  useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleWindowResize);
    window.scrollTo(0, 0)
    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

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
          <Search mobile={mobile}/>
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

import React, {useState} from 'react'
import SearchIcon from '@material-ui/icons/Search';
import {connect} from "react-redux";
import "./Styles.css"
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import {setSearch} from "../application/actions/Search";
import {setCurrNode} from "../application/actions/Graph";
import {changeTheme, setDisplay} from "../application/actions/Nav";

function Search(props) {
  const [search, setSearch] = useState("");

  const format = (s) => {
    if (typeof s !== 'string') return ''
    s =  s.toLowerCase()
    if (s.charAt(s.length - 1) === ".") {
      return s.charAt(0).toUpperCase() + s.slice(1)
    } else {
      return s.charAt(0).toUpperCase() + s.slice(1) + "."
    }
  }

  function handleSearch() {

    props.callSearch(format(search));
    props.setCurrNode(format(search));
  }

  return (
  <div style={{paddingBottom: 10, backgroundColor: props.theme === "dark" ? "#383838" : "#f3f3f3"}}>
    <div style={{display: "flex", justifyContent: "center", marginBottom: 10, alignItems: "center", height: 25}}>
      <div style={{color: props.theme === "dark" ? "white" : "black"}} className={"menuButton"}
        onClick={() => props.setDisplay("goal-step")}
      >Goal-Step</div>
      <div style={{color: props.theme === "dark" ? "white" : "black", marginLeft: 10, marginRight: 10}}>|</div>
      <div style={{color: props.theme === "dark" ? "white" : "black"}} className={"menuButton"}
        onClick={() => props.setDisplay("tree")}
      >Graph</div>
    </div>
    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div style={{flex: 1}}/>

      <div className={"searchDiv"}
        style={{backgroundColor: props.theme === "dark" ? "rgba(29, 29, 29, 1)" : "white"}}
      >
        <input type="text" name="name" className={"searchInput"}
        style={{color: props.theme === "dark" ? "white" : "black"}}
        onChange={(e) => setSearch(e.target.value)}/>
      </div>

      <div className={"searchButton"} onClick={() => {handleSearch()}}>
        <SearchIcon style={{color: "white"}}/>
      </div>

      <div style={{flex: 1}}>
        <div style={{display: "flex", justifyContent: "flex-end"}}>
          <div style={{marginRight: 10, color: props.theme === "dark" ? "white" : "black", opacity: .75}}>theme: {props.theme}</div>
          <div
            style={{
              width: 25, height: 25, borderRadius: 25, backgroundColor: "white",
              borderColor: "black", borderWidth: 10, marginRight: 10, cursor: "pointer"
            }}
            onClick={() => props.changeTheme("light")}
          />
          <div
            style={{
              width: 25, height: 25, borderRadius: 25, backgroundColor: "#222222",
              borderColor: "black", borderWidth: 10, marginRight: "3em", cursor: "pointer"
            }}
            onClick={() => props.changeTheme("dark")}
          />
        </div>
      </div>
    </div>

  </div>
  )
}

/* Redux */
const mapStateToProps = (state) => {
  return {
    search: state.searchReducer.search,
    currNode: state.graphReducer.currNode,
    theme: state.navReducer.theme
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    callSearch: (search) => dispatch(setSearch(search)),
    setCurrNode: (search) => dispatch(setCurrNode(search)),
    setDisplay: (display) => dispatch(setDisplay(display)),
    changeTheme: (theme) => dispatch(changeTheme(theme))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)

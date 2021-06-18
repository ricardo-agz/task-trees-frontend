import React, {useEffect, useState} from "react"
import {setSearch} from "../application/actions/Search";
import {goBack, selectChild, setCurrNode} from "../application/actions/Graph";
import {connect} from "react-redux";
import AddIcon from '@material-ui/icons/Add';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import "./Styles.css"
// import Tree from 'react-tree-graph';
import Tree from 'react-d3-tree';

function View(props) {
  const [tree, setTree] = useState(null)
  const [translate, setTranslate] = useState({x: 0, y: 0})

  useEffect(() => {
    makeTree()
  }, [props.currNode])

  function hasChildren(step) {
    return !isNaN(parseInt(step))
  }

  function handleCallNode(node) {
    props.setCurrNode(format(node))
  }

  useEffect(() => {
    // const dimensions = treeContainer.getBoundingClientRect();


  }, [])

  const format = (s) => {
    if (typeof s !== 'string') return ''
    s =  s.toLowerCase()
    if (s.charAt(s.length - 1) === ".") {
      return s.charAt(0).toUpperCase() + s.slice(1)
    } else {
      return s.charAt(0).toUpperCase() + s.slice(1) + "."
    }
  }

  const renderRectSvgNode = ({ nodeDatum, toggleNode }) => (
    <g style={{}}>
      <circle cx="-10" cy="5" r="10"
        // width="20" height="20"
        // x="-10"
        onClick={toggleNode} fill={nodeDatum.children &&
        nodeDatum.children.length > 0 ? "slategray" : props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee"}/>
      <text fill={props.theme === "dark" ? "white" : "black"} strokeWidth="0" x="20">
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes?.retrievedSimilarity && (
        <text fill="gray" strokeWidth="0" x="20" y={"25"}>
          {nodeDatum.attributes.retrievedSimilarity}
          {/*{JSON.stringify(nodeDatum)}*/}
        </text>
      )}
    </g>
    // <div
    //   style={{
    //     // backgroundColor: "#2b56d2",
    //     backgroundColor: "rgb(6,98,191)",
    //     padding: 15, borderRadius: 50, color: "white"
    //   }}
    //   onClick={toggleNode}
    // >{nodeDatum.name}</div>
  );

  function getNodeFromKey(key) {
    return (props.parsedData[key])
  }
  function getNodeFromIndex(i) {
    return (props.graphData[i])
  }
  function nodeHasChildren(key) {
    return (props.parsedData[key] !== undefined && props.parsedData[key] !== null)
  }

  function makeTree() {
    let tree = {}
    if (props.currNode !== null) {
      tree = {
        name: props.currNode.goal,
        attributes: {retrievedSimilarity: null}
        // children: []
      }

      tree = recMakeTree(tree, 5)

      /*
      // console.log("get: " + JSON.stringify(getNodeFromIndex(7)))
      //
      // console.log("this: " + JSON.stringify(props.currNode))

      let curr = props.currNode;

      // while (curr.children && curr.children.length > 0) {
      //
      // }

      for (let i = 0; i < props.currNode.children.length; i++) {
        let child = props.currNode.children[i]
        let curr = tree



        if (hasChildren(child)) {
          tree.children[i] = {
            name: props.graphData[parseInt(child)].goal,
            children: []
          };
          for (let j = 0; j < props.graphData[parseInt(child)].children.length; j++) {
            let subChild = props.graphData[parseInt(child)].children[j]
            if (hasChildren(subChild)) {
              tree.children[i].children[j] = {
                name: props.graphData[parseInt(subChild)].goal,
                children: []
              };
            } else {
              tree.children[i].children[j] = {
                name: subChild,
                // children: null
              };
            }
          }
        } else {
          tree.children[i] = {
            name: child,
            // children: null
          };
        }
      } */
    }
    setTree(tree)
  }

  function recMakeTree(tree, n) {
    // base case
    if (!nodeHasChildren(tree.name) || n <= 0) {
      /*
        name: ....
        children: null
       */
      return tree
    } else {
      /*
        name: ....
        children: [, , , , ]
       */
      let currNode = getNodeFromKey(tree.name)
      let currNodeIndex = currNode.index
      let currNodeWithChildren = props.graphData[currNodeIndex]
      tree.children = new Array(currNodeWithChildren.children.length)
      for (let i = 0; i < tree.children.length; i++) {
        let child = currNodeWithChildren.children[i]

        if (hasChildren(child)) {
          // console.log("parent: " + tree.name.toLowerCase())
          // console.log("child: " + props.graphData[child].goal.toLowerCase())
          if (props.graphData[child].goal.toLowerCase() !== tree.name.toLowerCase()) {
            tree.children[i] = {name: props.graphData[child].goal, attributes: {retrievedSimilarity: currNode.retrieved_goals_similarity[i]}}
            tree.children[i] = recMakeTree(tree.children[i], n-1)
          } else {
            tree.children[i] = {name: props.graphData[child].goal, attributes: {retrievedSimilarity: currNode.retrieved_goals_similarity[i]}}
          }

        } else {
          tree.children[i] = {name: child, attributes: {retrievedSimilarity: currNode.retrieved_goals_similarity[i]}}
        }
      }

      return tree
    }
  }

  function hasMultipleLevels(node) {
    if (!node.hasSubChildren) {
      return false;
    }
    for (let i = 0; i < node.children.length; i++) {
      if (hasChildren(node.children[i])) {
        let child = props.graphData[node.children[i]]
        if (child && child.goal) {
          if (child.goal.toLowerCase() !== node.goal.toLowerCase()) {
            if (child.hasSubChildren) {
              return true;
            }
          }
        }
      }
    }
    return false
  }

  return (
    <div style={{height: "100%", flex: 1}}>

      <div style={{width: "100vw", height: 35, display: "flex", overflow: "hidden", overflowX: "scroll", marginTop: 10, marginBottom: 10}}
           className={"scrollView"}>
        {props.graphData.map((node) => (
          hasMultipleLevels(node) &&
          <div
            style={{
              backgroundColor: props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee",
              padding: 15, borderRadius: 50, color: "white",
              maxWidth: "300px",
              display: "flex",
              alignItems: "center",
              flexGrow: 0,
              flexShrink: 0,
              marginLeft: 5,
              marginRight: 5
            }}
            onClick={() => handleCallNode(node.goal)}
          >{node.goal.length > 30 ? node.goal.slice(0, 30) + "..." : node.goal}</div>

          // <ScrollNode node={node}/>
        ))}
      </div>

      { props.display === "goal-step" ?
      <div style={{display: "flex", flex: 1, height: "100%"}}>
        <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>

          {props.prevNodeStack.length > 0 &&
          <div
            onClick={() => props.goBack()}
            className={"backButton"}
          >
            <ChevronLeftIcon style={{color: "white"}}/>
          </div>
          }

          {props.currNode !== null && typeof props.currNode !== "string" &&
          <div
            style={{
              // backgroundColor: "#2b56d2",
              backgroundColor: props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee",
              padding: 15, borderRadius: 50, color: "white"
            }}
          >{props.currNode == null ? "null" : props.currNode.goal}</div>
          }
        </div>

        <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div>{
            props.currNode !== null && typeof(props.currNode) !== "string" &&
            <div>{props.currNode.children.map((step, index) => (
              <div style={{display: "flex", alignItems: "center"}}>
                <div
                  className={"similarity"}
                  style={{color: "white", fontSize: 12}}
                >
                  { parseFloat(props.currNode.retrieved_goals_similarity[index]).toFixed(2) }
                </div>

                <div
                  style={{
                    backgroundColor:props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee",
                    padding: 15,
                    borderRadius: 50, color: "white", margin: 10,
                    height: 10,
                    display: "flex",
                    alignItems: "center"
                  }}
                >

                  { hasChildren(step) ?
                    props.graphData[parseInt(step)].goal : step
                  }
                </div>

                {hasChildren(step) &&
                <div
                  className={"plusButton"}
                  onClick={() => props.selectChild(parseInt(step))}
                >
                  <AddIcon style={{color: "white"}}/>
                </div>
                }
              </div>
            ))}</div>
          }</div>
        </div>
      </div>

      :

        <div>
          {tree && tree !== {} &&
          <div style={{ width: '100vw', height: '90vh' }}>
            <Tree
              data={tree}
              rootNodeClassName="node__root"
              branchNodeClassName="node__branch"
              leafNodeClassName="node__leaf"
              style={{color: "white"}}
              // renderCustomNodeElement={({ nodeDatum, toggleNode }) => {(<div style={{width: 30, height: 30, backgroundColor: "red"}}></div>)}}
              renderCustomNodeElement={renderRectSvgNode}
              // height={800}
              // separation={{nonSiblings: 100, siblings: 200}}
              // width={800}
              // orientation={"vertical"}
              // animated
            />
          </div>
          }
        </div>

      }


    </div>
  )

  // if (props.display === "goal-step") {
  //   return (
  //
  //   )
  // } else {
  //
  // }

  // return (
    // <div>
    //   {JSON.stringify(props.currNode)}
    //   <div style={{color: "white"}}>
    //     {/*{JSON.stringify(props.graphData[2])}*/}
    //     {props.currNode !== null && props.currNode.children &&
    //       <div>
    //         {props.currNode.children.map((child) => (
    //           <div>
    //             {child}
    //           </div>
    //         ))}
    //       </div>
    //     }
    //   </div>
    //   {/*{props.currNode !== null && props.currNode.children &&*/}
    //   {/*  <div>*/}
    //   {/*    {props.currNode.children.map((child) => (*/}
    //   {/*      <div>*/}
    //   {/*        Bruh*/}
    //   {/*        {JSON.stringify(child)}*/}
    //   {/*      </div>*/}
    //   {/*    ))}*/}
    //   {/*  </div>*/}
    //   {/*}*/}
    // </div>
  // )
}

/* Redux */
const mapStateToProps = (state) => {
  return {
    search: state.searchReducer.search,
    currNode: state.graphReducer.currNode,
    prevNodeStack: state.graphReducer.prevNodeStack,
    parsedData: state.graphReducer.parsedData,
    graphData: state.graphReducer.graphData,
    display: state.navReducer.display,
    theme: state.navReducer.theme
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    callSearch: (search) => dispatch(setSearch(search)),
    setCurrNode: (search) => dispatch(setCurrNode(search)),
    selectChild: (i) => dispatch(selectChild(i)),
    goBack: () => dispatch(goBack())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(View)

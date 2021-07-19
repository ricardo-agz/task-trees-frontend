import React, {useCallback, useEffect, useState} from "react"
import {setSearch} from "../application/actions/Search";
import {goBack, selectChild, setCurrNode} from "../application/actions/Graph";
import {connect} from "react-redux";
import AddIcon from '@material-ui/icons/Add';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import "./Styles.css"
// import Tree from 'react-tree-graph';
import Tree from 'react-d3-tree';

const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState(defaultTranslate);
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 2 });
    }
  }, []);
  return [translate, containerRef];
};

function View(props) {
  const [translate, containerRef] = useCenteredTree();
  const [tree, setTree] = useState(null)
  const [goals, setGoals] = useState(null)
  const [currGoal, setCurrGoal] = useState(null)
  const [currGoalChildren, setCurrGoalChildren] = useState(null)
  const nodeSize = { x: 350, y: 200 };
  const foreignObjectProps = { width: nodeSize.x - 75, height: nodeSize.y, x: 20 }

  const baseURL = "https://wikihow-trees-backend.herokuapp.com/"

  function hasChildren(step) {
    return !isNaN(parseInt(step))
  }

  const renderForeignObjectNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => (
    <g>
      <circle r={15} fill={nodeDatum.goal ? "slategray" : props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee"}></circle>
      {/* `foreignObject` requires width & height to be explicitly set. */}
      <foreignObject {...foreignObjectProps}>
        <div style={{ borderRadius: 25, backgroundColor: props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee", padding: 15}}>
          <div style={{ textAlign: "center", color: "white" }}>{nodeDatum.name}</div>

          {nodeDatum.children && (
            <div style={{ width: "100%", textAlign: "center", color: "lightgray", marginTop: 10}} onClick={toggleNode}>
              {nodeDatum.__rd3t.collapsed ? "Expand" : "Collapse"}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );

  const renderRectSvgNode = ({ nodeDatum, toggleNode }) => (
    <g style={{}}>
      <circle cx="-10" cy="5" r="10"
              onClick={toggleNode} fill={nodeDatum.children &&
      nodeDatum.goal ? "slategray" : props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee"}/>
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
  );

  useEffect(() => {
    fetch(`${baseURL}goals`)
      .then(response => response.json())
      .then(data => setGoals(data))
  }, [])

  async function makeTree() {
    let tree = {}
    if (currGoal !== null) {
      tree = {
        name: currGoal.name,
        goal: true,
        id: currGoal.id,
        attributes: {retrievedSimilarity: null}
        // children: []
      }
      tree = await recMakeTreeAPI(tree, 15)
    }
    setTree(tree)
  }

  async function stepHasChildrenAPI(stepId) {
    const response = await fetch(`${baseURL}goals/1/steps/${stepId}/edges`)
    if (!response.ok) {
      return false;
    }
    const data = await response.json()
    const formatted = await JSON.parse(JSON.stringify(data))
    if (Array.isArray(formatted)) {
      return formatted.length > 0;
    }
    return false;
  }

  async function getGoalChildren(goalId) {
    const response = await fetch(`${baseURL}goals/${goalId}/steps`)
    if (!response.ok) {
      return null;
    }
    const data = await response.json()
    const formatted = await JSON.parse(JSON.stringify(data))
    return formatted
  }

  async function getStepChildren(stepId) {
    const response = await fetch(`${baseURL}goals/1/steps/${stepId}/edges`)
    if (!response.ok) {
      return null;
    }
    const data = await response.json()
    const formatted = await JSON.parse(JSON.stringify(data))
    return formatted
  }

  async function recMakeTreeAPI(tree, n) {

    // STEP
    if (!tree.goal) {

      // curr tree is STEP
      let hasChildren = await stepHasChildrenAPI(tree.id)

      // Base Case
      if (!hasChildren || n <= 0) {
        return tree;
      }

      // Recursive step
      else {
        let children = await getStepChildren(tree.id)
        console.log("this must be here: " + JSON.stringify(children))

        // edge case (error)
        if (children === null) {
          return tree;
        }

        tree.children = new Array(children.length)
        for (let i = 0; i < tree.children.length; i++) {

          // child is a GOAL
          let child = children[i]

          console.log("this child: " + JSON.stringify(child))

          tree.children[i] = {
            name: child.name,
            id: child.id,
            goal: true,
            attributes: {retrievedSimilarity: null}
          }
          tree.children[i] = await recMakeTreeAPI(tree.children[i], n-1)
        }

        return tree;
      }
    }

    // GOAL
    else {
      // curr tree is GOAL
      let children = await getGoalChildren(tree.id)

      // edge case (error)
      if (children === null) {
        return tree;
      }

      tree.children = new Array(children.length)
      for (let i = 0; i < tree.children.length; i++) {
        // child is a STEP
        let child = children[i]
        let hasChildren = await stepHasChildrenAPI(child.id)

        if (hasChildren) {
          tree.children[i] = {
            name: child.name,
            id: child.id,
            goal: false,
            attributes: {retrievedSimilarity: null}
          }
          tree.children[i] = await recMakeTreeAPI(tree.children[i], n-1)
        } else {
          tree.children[i] = {
            name: child.name,
            id: child.id,
            goal: false,
            attributes: {retrievedSimilarity: null}
          }
        }
      }
    }

    return tree;
  }

  async function handleClickGoal(goal) {
    setCurrGoal(goal)
    await makeTree()
  }

  useEffect(() => {
    if (props.currNode) {
      fetch(`${baseURL}goals/${props.currNode}`)
        .then(response => response.json())
        .then(data => {setCurrGoal(data)})
    }
  }, [props.currNode])

  useEffect(async () => {
    if (currGoal) {
      await makeTree()
      let children = await getGoalChildren(currGoal.id)
      setCurrGoalChildren(children)
    }
  }, [currGoal])

  return (
    <div style={{height: "100%", flex: 1}}>

      <div style={{width: "100vw", height: 35, display: "flex", overflow: "hidden", overflowX: "scroll", marginTop: 10, marginBottom: 10}}
           className={"scrollView"}>
        {goals && goals.map((node) => (
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
            onClick={async () => await handleClickGoal(node)}
          >
            {node.name.length > 30 ? node.name.slice(0, 30) + "..." : node.name}
          </div>
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

          {currGoal &&
          <div
            style={{
              backgroundColor: props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee",
              padding: 15, borderRadius: 50, color: "white"
            }}
          >{currGoal === null ? "null" : currGoal.name}</div>
          }
        </div>

        <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div>{currGoalChildren &&

            currGoalChildren.map((child, index) => (
              <div>{"bruh"}</div>
            ))

            // null

          //   currGoalChildren.map((step, index) => (
          //   <div style={{display: "flex", alignItems: "center"}}>
          //     <div
          //       className={"similarity"}
          //       style={{color: "white", fontSize: 12}}
          //     >
          //       {/*{ parseFloat(props.currNode.retrieved_goals_similarity[index]).toFixed(2) }*/}
          //     </div>
          //
          //     <div
          //       style={{
          //         backgroundColor:props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee",
          //         padding: 15,
          //         borderRadius: 50, color: "white", margin: 10,
          //         height: 10,
          //         display: "flex",
          //         alignItems: "center"
          //       }}
          //     >
          //
          //       { step.name }
          //     </div>
          //
          //     { stepHasChildrenAPI(step.id).then(res => {
          //       return (res &&
          //         <div
          //           className={"plusButton"}
          //           onClick={() => props.selectChild(parseInt(step))}
          //         >
          //           <AddIcon style={{color: "white"}}/>
          //         </div>)
          //     })
          //     }
          //
          //     {/*{hasChildren(step) &&*/}
          //     {/*<div*/}
          //     {/*  className={"plusButton"}*/}
          //     {/*  onClick={() => props.selectChild(parseInt(step))}*/}
          //     {/*>*/}
          //     {/*  <AddIcon style={{color: "white"}}/>*/}
          //     {/*</div>*/}
          //     {/*}*/}
          //   </div>
          // ))

          }</div>

          {/*<div>{*/}
          {/*  props.currNode !== null && typeof(props.currNode) !== "string" &&*/}
          {/*  <div>{currGoalChildren && currGoalChildren.map((step, index) => (*/}
          {/*    <div style={{display: "flex", alignItems: "center"}}>*/}
          {/*      <div*/}
          {/*        className={"similarity"}*/}
          {/*        style={{color: "white", fontSize: 12}}*/}
          {/*      >*/}
          {/*        /!*{ parseFloat(props.currNode.retrieved_goals_similarity[index]).toFixed(2) }*!/*/}
          {/*      </div>*/}

          {/*      <div*/}
          {/*        style={{*/}
          {/*          backgroundColor:props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee",*/}
          {/*          padding: 15,*/}
          {/*          borderRadius: 50, color: "white", margin: 10,*/}
          {/*          height: 10,*/}
          {/*          display: "flex",*/}
          {/*          alignItems: "center"*/}
          {/*        }}*/}
          {/*      >*/}

          {/*        { step.name }*/}
          {/*      </div>*/}

          {/*      { stepHasChildrenAPI(step.id).then(res => {*/}
          {/*        return (res &&*/}
          {/*          <div*/}
          {/*            className={"plusButton"}*/}
          {/*            onClick={() => props.selectChild(parseInt(step))}*/}
          {/*          >*/}
          {/*            <AddIcon style={{color: "white"}}/>*/}
          {/*          </div>)*/}
          {/*      })*/}
          {/*      }*/}

          {/*      /!*{hasChildren(step) &&*!/*/}
          {/*      /!*<div*!/*/}
          {/*      /!*  className={"plusButton"}*!/*/}
          {/*      /!*  onClick={() => props.selectChild(parseInt(step))}*!/*/}
          {/*      /!*>*!/*/}
          {/*      /!*  <AddIcon style={{color: "white"}}/>*!/*/}
          {/*      /!*</div>*!/*/}
          {/*      /!*}*!/*/}
          {/*    </div>*/}
          {/*  ))}</div>*/}
          {/*}</div>*/}
        </div>
      </div>

      :

        <div>



          {tree && tree !== {} &&
          <div style={{ width: '100vw', height: '85vh' }} ref={containerRef}>
            <Tree
              data={tree}
              rootNodeClassName="node__root"
              branchNodeClassName="node__branch"
              leafNodeClassName="node__leaf"
              style={{color: "white"}}
              nodeSize={nodeSize}
              renderCustomNodeElement={(rd3tProps) =>
                renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
              }
              orientation="vertical"
              translate={translate}
            />
          </div>
          }

          {/* Legend */}
          <div style={{display: "flex", marginLeft: 15, position: "fixed", left: 15, bottom: 15}}>
            <div style={{marginRight: 20, color: props.theme === "dark" ? "white" : "black"}}>legend:</div>
            <div style={{backgroundColor: 'slategray', width: 25, height: 25, borderRadius: 25, marginRight: 10}}/>
            <div style={{marginRight: 15, color: props.theme === "dark" ? "white" : "black"}}>goal</div>
            <div style={{backgroundColor: props.theme === "dark" ? "rgb(6,98,191)" : "#3ba1ee", width: 25, height: 25, borderRadius: 25, marginRight: 10}}/>
            <div style={{marginRight: 15, color: props.theme === "dark" ? "white" : "black"}}>step</div>
          </div>

        </div>

      }


    </div>
  )
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

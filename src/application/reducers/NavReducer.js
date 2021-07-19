import {CHANGETHEME, SETDISPLAY} from "../Types";

const initialState = {
  display: "graph",
  theme: "dark"
}

const navReducer = (state = initialState, action) => {

  switch (action.type) {
    case SETDISPLAY:
      return {
        ...state,
        display: action.data
      }
    case CHANGETHEME:
      return {
        ...state,
        theme: action.data
      }
    default:
      return state;
  }
}

export default navReducer

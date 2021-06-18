import {CHANGETHEME, SETDISPLAY} from "../Types";

export const setDisplay = (display) => (
  {
    type: SETDISPLAY,
    data: display
  }
)

export const changeTheme = (theme) => (
  {
    type: CHANGETHEME,
    data: theme
  }
)

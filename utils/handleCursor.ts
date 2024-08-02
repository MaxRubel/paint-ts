function expandingCursors(event_state: string): string {
  let cursor = 'default'
  const [_, type] = event_state.split("-")
  if (type === 'n' || type === 's') {
    cursor = 'ns-resize'
  } else if (type === 'w' || type === 'e') {
    cursor = 'ew-resize'
  } else if (type === 'nw' || type === 'se') {
    cursor = 'nwse-resize'
  } else if (type === 'ne' || type === 'sw') {
    cursor = 'nesw-resize'
  }
  return cursor
}


export default function handleCursor(event_state: string, cursor: string): string {
  if (event_state.includes("expanding")) {
    cursor = expandingCursors(event_state)
    return cursor
  }
  switch (event_state) {
    case "creating_text":
      cursor = "text";
      break;
    case "drawing":
      cursor = "crosshair";
      break;
    case "arrow":
      cursor = "default";
      break;
    case "selected":
      cursor = "default";
      break;
    case "rectangle-draw":
      cursor = "crosshair";
      break;
  }
  return cursor
}
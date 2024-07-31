export default function handleCursor(event_state: string): string {
  let cursor = "arrow"
  switch (event_state) {
    case "createTextBox":
      cursor = "text";
      break;
    case "drawing":
      cursor = "crosshair";
      break;
    case "arrow":
      cursor = "default";
      break;
    case "rectangle-draw":
      cursor = "crosshair";
      break;
  }
  return cursor
}
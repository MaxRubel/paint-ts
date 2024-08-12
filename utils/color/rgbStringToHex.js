function rgbStringToHex(rgbString) {
  // Use regex to extract the RGB values
  const rgbMatch = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if (!rgbMatch) {
    throw new Error('Invalid RGB string format. Expected "rgb(r, g, b)"');
  }

  // Convert the matched values to numbers
  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);

  // Convert to hex and pad with zeros if necessary
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  // Combine the hex values
  return "#" + toHex(r) + toHex(g) + toHex(b);
}
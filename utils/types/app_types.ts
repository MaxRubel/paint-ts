export interface TextBoxType {
  type: 'textbox'
  id: string;
  text: string;
  x: number;
  y: number;
  height: number;
  width: number;
  fontColor: string;
  align: string
}

export interface RectangleType {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  color: string;
  fill: string;
}

export interface UndoType {
  action: string,
  data: any
}

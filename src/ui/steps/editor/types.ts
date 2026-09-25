export interface EditorCallbacks {
  onMove: (id: string, dx: number, dy: number) => void;
  onResize: (id: string, factor: number) => void;
  onReset: (id: string | undefined) => void;
}

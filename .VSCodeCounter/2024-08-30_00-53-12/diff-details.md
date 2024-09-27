# Diff Details

Date : 2024-08-30 00:53:12

Directory /Users/suzrubel/Documents/Workspace/svelte/paint-ts

Total : 71 files,  886 codes, 108 comments, 197 blanks, all 1191 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [api/doodles.ts](/api/doodles.ts) | TypeScript | 32 | 0 | 3 | 35 |
| [map.js](/map.js) | JavaScript | -5 | 0 | -4 | -9 |
| [package-lock.json](/package-lock.json) | JSON | 7 | 0 | 0 | 7 |
| [package.json](/package.json) | JSON | 1 | 0 | 0 | 1 |
| [src/App.svelte](/src/App.svelte) | Svelte | 10 | 1 | 0 | 11 |
| [src/app.css](/src/app.css) | CSS | 11 | 0 | 4 | 15 |
| [src/components/BrushSettings.svelte](/src/components/BrushSettings.svelte) | Svelte | -359 | -4 | -34 | -397 |
| [src/components/ColorBarBottom.svelte](/src/components/ColorBarBottom.svelte) | Svelte | -303 | -1 | -36 | -340 |
| [src/components/ColorBarSide.svelte](/src/components/ColorBarSide.svelte) | Svelte | -195 | -1 | -23 | -219 |
| [src/components/ColorBottom2.svelte](/src/components/ColorBottom2.svelte) | Svelte | -464 | -1 | -50 | -515 |
| [src/components/DrawingRoomDataHandler.svelte](/src/components/DrawingRoomDataHandler.svelte) | Svelte | 187 | 24 | 28 | 239 |
| [src/components/MainCanvasHub.svelte](/src/components/MainCanvasHub.svelte) | Svelte | 305 | 0 | 29 | 334 |
| [src/components/MainPage.svelte](/src/components/MainPage.svelte) | Svelte | -289 | -1 | -31 | -321 |
| [src/components/PageTurn.svelte](/src/components/PageTurn.svelte) | Svelte | -26 | 0 | -3 | -29 |
| [src/components/SideBar.svelte](/src/components/SideBar.svelte) | Svelte | -102 | -3 | -13 | -118 |
| [src/components/Slider.svelte](/src/components/Slider.svelte) | Svelte | -285 | -2 | -42 | -329 |
| [src/components/TextSettings.svelte](/src/components/TextSettings.svelte) | Svelte | -337 | -12 | -37 | -386 |
| [src/components/Text_Box.svelte](/src/components/Text_Box.svelte) | Svelte | -691 | -9 | -63 | -763 |
| [src/components/ToolBar.svelte](/src/components/ToolBar.svelte) | Svelte | -184 | -17 | -23 | -224 |
| [src/components/ToolBar2.svelte](/src/components/ToolBar2.svelte) | Svelte | -93 | 0 | -13 | -106 |
| [src/components/canvas elements/PeerMouse.svelte](/src/components/canvas%20elements/PeerMouse.svelte) | Svelte | 16 | 0 | 4 | 20 |
| [src/components/canvas elements/Text_Box.svelte](/src/components/canvas%20elements/Text_Box.svelte) | Svelte | 670 | 9 | 64 | 743 |
| [src/components/forms/ColorPaletteForm.svelte](/src/components/forms/ColorPaletteForm.svelte) | Svelte | 20 | 0 | 1 | 21 |
| [src/components/forms/ConfirmDrawingRoomForm.svelte](/src/components/forms/ConfirmDrawingRoomForm.svelte) | Svelte | 100 | 0 | 18 | 118 |
| [src/components/forms/ConfirmJoinDrawingRoom.svelte](/src/components/forms/ConfirmJoinDrawingRoom.svelte) | Svelte | 91 | 0 | 18 | 109 |
| [src/components/forms/FormRouter.svelte](/src/components/forms/FormRouter.svelte) | Svelte | 16 | 0 | 0 | 16 |
| [src/components/forms/ViewDoodles.svelte](/src/components/forms/ViewDoodles.svelte) | Svelte | -147 | 0 | -19 | -166 |
| [src/components/menus/DebugMenu.svelte](/src/components/menus/DebugMenu.svelte) | Svelte | 43 | 2 | 4 | 49 |
| [src/components/menus/LargeViewPalettes.svelte](/src/components/menus/LargeViewPalettes.svelte) | Svelte | 78 | 0 | 11 | 89 |
| [src/components/menus/MultiplayerDebug.svelte](/src/components/menus/MultiplayerDebug.svelte) | Svelte | 0 | 80 | 1 | 81 |
| [src/components/menus/NavMenu.svelte](/src/components/menus/NavMenu.svelte) | Svelte | 95 | 0 | 6 | 101 |
| [src/components/menus/OpenDoodleMenu.svelte](/src/components/menus/OpenDoodleMenu.svelte) | Svelte | 157 | 0 | 19 | 176 |
| [src/components/menus/ShareMenu.svelte](/src/components/menus/ShareMenu.svelte) | Svelte | 218 | 0 | 24 | 242 |
| [src/components/menus/SmallPalette.svelte](/src/components/menus/SmallPalette.svelte) | Svelte | 73 | 2 | 10 | 85 |
| [src/components/menus/SmallViewPalettes.svelte](/src/components/menus/SmallViewPalettes.svelte) | Svelte | -1 | 0 | 0 | -1 |
| [src/components/menus/TinyPaletteMenu.svelte](/src/components/menus/TinyPaletteMenu.svelte) | Svelte | 62 | 0 | 7 | 69 |
| [src/components/toolbars/BrushSettings.svelte](/src/components/toolbars/BrushSettings.svelte) | Svelte | 127 | 0 | 19 | 146 |
| [src/components/toolbars/ColorPickerInSettings.svelte](/src/components/toolbars/ColorPickerInSettings.svelte) | Svelte | 193 | 1 | 20 | 214 |
| [src/components/toolbars/EraserSettings.svelte](/src/components/toolbars/EraserSettings.svelte) | Svelte | 61 | 0 | 11 | 72 |
| [src/components/toolbars/PaletteInSettings.svelte](/src/components/toolbars/PaletteInSettings.svelte) | Svelte | 219 | 0 | 27 | 246 |
| [src/components/toolbars/Slider.svelte](/src/components/toolbars/Slider.svelte) | Svelte | 292 | 2 | 42 | 336 |
| [src/components/toolbars/TextSettings.svelte](/src/components/toolbars/TextSettings.svelte) | Svelte | 240 | 0 | 28 | 268 |
| [src/components/toolbars/TopToolBar.svelte](/src/components/toolbars/TopToolBar.svelte) | Svelte | 111 | 0 | 14 | 125 |
| [src/components/toolbars/UndoRedoBottom.svelte](/src/components/toolbars/UndoRedoBottom.svelte) | Svelte | 26 | 0 | 3 | 29 |
| [src/graphics/ArrowLeft.svelte](/src/graphics/ArrowLeft.svelte) | Svelte | 17 | 0 | 4 | 21 |
| [src/graphics/EditIcon.svelte](/src/graphics/EditIcon.svelte) | Svelte | 16 | 0 | 1 | 17 |
| [src/graphics/Eraser.svelte](/src/graphics/Eraser.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/EraserStroke.svelte](/src/graphics/EraserStroke.svelte) | Svelte | 13 | 0 | 2 | 15 |
| [src/graphics/MouseCursor.svelte](/src/graphics/MouseCursor.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [stores/canvasStore.ts](/stores/canvasStore.ts) | TypeScript | 18 | 4 | 6 | 28 |
| [stores/colorStore.ts](/stores/colorStore.ts) | TypeScript | -2 | 0 | -1 | -3 |
| [stores/drawingRoomStore.ts](/stores/drawingRoomStore.ts) | TypeScript | 93 | 3 | 16 | 112 |
| [stores/fetchDataStore.ts](/stores/fetchDataStore.ts) | TypeScript | 9 | 0 | 0 | 9 |
| [stores/paletteStore.ts](/stores/paletteStore.ts) | TypeScript | 27 | 0 | 5 | 32 |
| [stores/redoStore.ts](/stores/redoStore.ts) | TypeScript | -15 | 1 | 1 | -13 |
| [stores/textBoxStore.ts](/stores/textBoxStore.ts) | TypeScript | 16 | 0 | 4 | 20 |
| [stores/undoStore.ts](/stores/undoStore.ts) | TypeScript | 43 | 2 | 2 | 47 |
| [stores/userPrefsStore.ts](/stores/userPrefsStore.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [testing.js](/testing.js) | JavaScript | 7 | 0 | 1 | 8 |
| [utils/auth/auth_store.ts](/utils/auth/auth_store.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [utils/auth/firebase.js](/utils/auth/firebase.js) | JavaScript | -42 | -1 | -5 | -48 |
| [utils/auth/firebase.ts](/utils/auth/firebase.ts) | TypeScript | 42 | 1 | 5 | 48 |
| [utils/drawBrushStroke.ts](/utils/drawBrushStroke.ts) | TypeScript | 113 | 10 | 29 | 152 |
| [utils/handleCursor.ts](/utils/handleCursor.ts) | TypeScript | 3 | 0 | 0 | 3 |
| [utils/initDrawingRoomSocket.ts](/utils/initDrawingRoomSocket.ts) | TypeScript | 38 | 0 | 10 | 48 |
| [utils/types/app_types.ts](/utils/types/app_types.ts) | TypeScript | 4 | 0 | 1 | 5 |
| [utils/types/undo_types.ts](/utils/types/undo_types.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [utils/videoToCanvas.ts](/utils/videoToCanvas.ts) | TypeScript | 54 | 7 | 13 | 74 |
| [utils/webRTCDataMessages.ts](/utils/webRTCDataMessages.ts) | TypeScript | 64 | 1 | 13 | 78 |
| [utils/webRTCNegotiate.ts](/utils/webRTCNegotiate.ts) | TypeScript | 231 | 10 | 43 | 284 |
| [utils/websocketHub.ts](/utils/websocketHub.ts) | TypeScript | 129 | 0 | 18 | 147 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details
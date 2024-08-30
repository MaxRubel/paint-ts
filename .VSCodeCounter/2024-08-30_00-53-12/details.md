# Details

Date : 2024-08-30 00:53:12

Directory /Users/suzrubel/Documents/Workspace/svelte/paint-ts

Total : 110 files,  10110 codes, 198 comments, 1024 blanks, all 11332 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.prettierrc](/.prettierrc) | JSON | 6 | 0 | 0 | 6 |
| [README.md](/README.md) | Markdown | 27 | 0 | 21 | 48 |
| [api/doodles.ts](/api/doodles.ts) | TypeScript | 95 | 0 | 9 | 104 |
| [api/palette.ts](/api/palette.ts) | TypeScript | 48 | 1 | 5 | 54 |
| [api/user.ts](/api/user.ts) | TypeScript | 27 | 0 | 2 | 29 |
| [index.html](/index.html) | HTML | 14 | 0 | 3 | 17 |
| [package-lock.json](/package-lock.json) | JSON | 2,758 | 0 | 1 | 2,759 |
| [package.json](/package.json) | JSON | 30 | 0 | 1 | 31 |
| [public/vite.svg](/public/vite.svg) | XML | 1 | 0 | 0 | 1 |
| [src/App.svelte](/src/App.svelte) | Svelte | 45 | 1 | 6 | 52 |
| [src/app.css](/src/app.css) | CSS | 137 | 5 | 24 | 166 |
| [src/assets/svelte.svg](/src/assets/svelte.svg) | XML | 1 | 0 | 0 | 1 |
| [src/components/DrawingRoomDataHandler.svelte](/src/components/DrawingRoomDataHandler.svelte) | Svelte | 187 | 24 | 28 | 239 |
| [src/components/MainCanvasHub.svelte](/src/components/MainCanvasHub.svelte) | Svelte | 305 | 0 | 29 | 334 |
| [src/components/alerts/Alert.svelte](/src/components/alerts/Alert.svelte) | Svelte | 47 | 0 | 7 | 54 |
| [src/components/canvas elements/PeerMouse.svelte](/src/components/canvas%20elements/PeerMouse.svelte) | Svelte | 16 | 0 | 4 | 20 |
| [src/components/canvas elements/Text_Box.svelte](/src/components/canvas%20elements/Text_Box.svelte) | Svelte | 670 | 9 | 64 | 743 |
| [src/components/forms/ColorPaletteForm.svelte](/src/components/forms/ColorPaletteForm.svelte) | Svelte | 309 | 0 | 33 | 342 |
| [src/components/forms/ConfirmDrawingRoomForm.svelte](/src/components/forms/ConfirmDrawingRoomForm.svelte) | Svelte | 100 | 0 | 18 | 118 |
| [src/components/forms/ConfirmJoinDrawingRoom.svelte](/src/components/forms/ConfirmJoinDrawingRoom.svelte) | Svelte | 91 | 0 | 18 | 109 |
| [src/components/forms/FormRouter.svelte](/src/components/forms/FormRouter.svelte) | Svelte | 41 | 0 | 5 | 46 |
| [src/components/forms/SaveConfirmForm.svelte](/src/components/forms/SaveConfirmForm.svelte) | Svelte | 84 | 0 | 10 | 94 |
| [src/components/forms/SavingNewProjectForm.svelte](/src/components/forms/SavingNewProjectForm.svelte) | Svelte | 81 | 0 | 15 | 96 |
| [src/components/forms/UserRegistrationForm.svelte](/src/components/forms/UserRegistrationForm.svelte) | Svelte | 50 | 0 | 12 | 62 |
| [src/components/menus/DebugMenu.svelte](/src/components/menus/DebugMenu.svelte) | Svelte | 211 | 2 | 25 | 238 |
| [src/components/menus/LargeViewPalettes.svelte](/src/components/menus/LargeViewPalettes.svelte) | Svelte | 78 | 0 | 11 | 89 |
| [src/components/menus/MultiplayerDebug.svelte](/src/components/menus/MultiplayerDebug.svelte) | Svelte | 0 | 80 | 1 | 81 |
| [src/components/menus/NavMenu.svelte](/src/components/menus/NavMenu.svelte) | Svelte | 262 | 0 | 31 | 293 |
| [src/components/menus/OpenDoodleMenu.svelte](/src/components/menus/OpenDoodleMenu.svelte) | Svelte | 157 | 0 | 19 | 176 |
| [src/components/menus/ShareMenu.svelte](/src/components/menus/ShareMenu.svelte) | Svelte | 218 | 0 | 24 | 242 |
| [src/components/menus/SmallPalette.svelte](/src/components/menus/SmallPalette.svelte) | Svelte | 73 | 2 | 10 | 85 |
| [src/components/menus/SmallViewPalettes.svelte](/src/components/menus/SmallViewPalettes.svelte) | Svelte | 64 | 0 | 11 | 75 |
| [src/components/menus/TinyPaletteMenu.svelte](/src/components/menus/TinyPaletteMenu.svelte) | Svelte | 62 | 0 | 7 | 69 |
| [src/components/toolbars/BrushSettings.svelte](/src/components/toolbars/BrushSettings.svelte) | Svelte | 127 | 0 | 19 | 146 |
| [src/components/toolbars/ColorPickerInSettings.svelte](/src/components/toolbars/ColorPickerInSettings.svelte) | Svelte | 193 | 1 | 20 | 214 |
| [src/components/toolbars/EraserSettings.svelte](/src/components/toolbars/EraserSettings.svelte) | Svelte | 61 | 0 | 11 | 72 |
| [src/components/toolbars/PaletteInSettings.svelte](/src/components/toolbars/PaletteInSettings.svelte) | Svelte | 219 | 0 | 27 | 246 |
| [src/components/toolbars/Slider.svelte](/src/components/toolbars/Slider.svelte) | Svelte | 292 | 2 | 42 | 336 |
| [src/components/toolbars/TextSettings.svelte](/src/components/toolbars/TextSettings.svelte) | Svelte | 240 | 0 | 28 | 268 |
| [src/components/toolbars/TopToolBar.svelte](/src/components/toolbars/TopToolBar.svelte) | Svelte | 111 | 0 | 14 | 125 |
| [src/components/toolbars/UndoRedoBottom.svelte](/src/components/toolbars/UndoRedoBottom.svelte) | Svelte | 26 | 0 | 3 | 29 |
| [src/graphics/Arrow.svelte](/src/graphics/Arrow.svelte) | Svelte | 26 | 0 | 4 | 30 |
| [src/graphics/ArrowLeft.svelte](/src/graphics/ArrowLeft.svelte) | Svelte | 30 | 0 | 5 | 35 |
| [src/graphics/Close.svelte](/src/graphics/Close.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/CursorPointer.svelte](/src/graphics/CursorPointer.svelte) | Svelte | 13 | 0 | 1 | 14 |
| [src/graphics/DownArrow.svelte](/src/graphics/DownArrow.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/EditIcon.svelte](/src/graphics/EditIcon.svelte) | Svelte | 16 | 0 | 1 | 17 |
| [src/graphics/Eraser.svelte](/src/graphics/Eraser.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/EraserStroke.svelte](/src/graphics/EraserStroke.svelte) | Svelte | 13 | 0 | 2 | 15 |
| [src/graphics/Folder.svelte](/src/graphics/Folder.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/GearIcon.svelte](/src/graphics/GearIcon.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/Kiss.svelte](/src/graphics/Kiss.svelte) | Svelte | 13 | 0 | 1 | 14 |
| [src/graphics/Lock.svelte](/src/graphics/Lock.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/Marker.svelte](/src/graphics/Marker.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/Moon.svelte](/src/graphics/Moon.svelte) | Svelte | 15 | 0 | 1 | 16 |
| [src/graphics/MouseCursor.svelte](/src/graphics/MouseCursor.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/NavButton.svelte](/src/graphics/NavButton.svelte) | Svelte | 13 | 0 | 1 | 14 |
| [src/graphics/Navbar.svelte](/src/graphics/Navbar.svelte) | Svelte | 13 | 0 | 1 | 14 |
| [src/graphics/Rectangle.svelte](/src/graphics/Rectangle.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/Redo.svelte](/src/graphics/Redo.svelte) | Svelte | 16 | 0 | 1 | 17 |
| [src/graphics/SaveIcon.svelte](/src/graphics/SaveIcon.svelte) | Svelte | 13 | 0 | 1 | 14 |
| [src/graphics/SideArrow.svelte](/src/graphics/SideArrow.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/SmallCheck.svelte](/src/graphics/SmallCheck.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/Sun.svelte](/src/graphics/Sun.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/TextCenter.svelte](/src/graphics/TextCenter.svelte) | Svelte | 14 | 0 | 1 | 15 |
| [src/graphics/TextIcon.svelte](/src/graphics/TextIcon.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/graphics/TextLeft.svelte](/src/graphics/TextLeft.svelte) | Svelte | 14 | 0 | 1 | 15 |
| [src/graphics/TextRight.svelte](/src/graphics/TextRight.svelte) | Svelte | 14 | 0 | 1 | 15 |
| [src/graphics/TrashCan.svelte](/src/graphics/TrashCan.svelte) | Svelte | 13 | 0 | 1 | 14 |
| [src/graphics/TrashCanBig.svelte](/src/graphics/TrashCanBig.svelte) | Svelte | 13 | 0 | 1 | 14 |
| [src/graphics/Undo.svelte](/src/graphics/Undo.svelte) | Svelte | 16 | 0 | 1 | 17 |
| [src/graphics/Unlock.svelte](/src/graphics/Unlock.svelte) | Svelte | 12 | 0 | 1 | 13 |
| [src/lib/Counter.svelte](/src/lib/Counter.svelte) | Svelte | 9 | 0 | 2 | 11 |
| [src/main.ts](/src/main.ts) | TypeScript | 6 | 0 | 3 | 9 |
| [src/vite-env.d.ts](/src/vite-env.d.ts) | TypeScript | 0 | 2 | 1 | 3 |
| [stores/alertStore.ts](/stores/alertStore.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [stores/brushStore.ts](/stores/brushStore.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [stores/canvasStore.ts](/stores/canvasStore.ts) | TypeScript | 44 | 4 | 8 | 56 |
| [stores/drawingRoomStore.ts](/stores/drawingRoomStore.ts) | TypeScript | 93 | 3 | 16 | 112 |
| [stores/eventState.ts](/stores/eventState.ts) | TypeScript | 5 | 0 | 6 | 11 |
| [stores/fetchDataStore.ts](/stores/fetchDataStore.ts) | TypeScript | 83 | 0 | 11 | 94 |
| [stores/paletteStore.ts](/stores/paletteStore.ts) | TypeScript | 118 | 1 | 21 | 140 |
| [stores/redoStore.ts](/stores/redoStore.ts) | TypeScript | 128 | 1 | 19 | 148 |
| [stores/textBoxStore.ts](/stores/textBoxStore.ts) | TypeScript | 120 | 1 | 19 | 140 |
| [stores/undoStore.ts](/stores/undoStore.ts) | TypeScript | 272 | 3 | 24 | 299 |
| [stores/userPrefsStore.ts](/stores/userPrefsStore.ts) | TypeScript | 8 | 0 | 3 | 11 |
| [svelte.config.js](/svelte.config.js) | JavaScript | 4 | 2 | 2 | 8 |
| [testing.js](/testing.js) | JavaScript | 7 | 0 | 1 | 8 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 14 | 6 | 1 | 21 |
| [tsconfig.node.json](/tsconfig.node.json) | JSON | 10 | 0 | 1 | 11 |
| [utils/auth/auth_store.ts](/utils/auth/auth_store.ts) | TypeScript | 23 | 0 | 5 | 28 |
| [utils/auth/firebase.ts](/utils/auth/firebase.ts) | TypeScript | 42 | 1 | 5 | 48 |
| [utils/clearSelection.ts](/utils/clearSelection.ts) | TypeScript | 4 | 0 | 1 | 5 |
| [utils/color/rgbStringToHex.js](/utils/color/rgbStringToHex.js) | JavaScript | 14 | 4 | 4 | 22 |
| [utils/demoDrag.svelte](/utils/demoDrag.svelte) | Svelte | 52 | 1 | 13 | 66 |
| [utils/dragMultiple.ts](/utils/dragMultiple.ts) | TypeScript | 55 | 9 | 17 | 81 |
| [utils/drawBrushStroke.ts](/utils/drawBrushStroke.ts) | TypeScript | 203 | 10 | 40 | 253 |
| [utils/drawRectangle.ts](/utils/drawRectangle.ts) | TypeScript | 30 | 1 | 6 | 37 |
| [utils/drawSelectBox.ts](/utils/drawSelectBox.ts) | TypeScript | 105 | 0 | 19 | 124 |
| [utils/getSvgPathFromStroke.ts](/utils/getSvgPathFromStroke.ts) | TypeScript | 27 | 0 | 7 | 34 |
| [utils/handleCursor.ts](/utils/handleCursor.ts) | TypeScript | 41 | 0 | 2 | 43 |
| [utils/initDrawingRoomSocket.ts](/utils/initDrawingRoomSocket.ts) | TypeScript | 38 | 0 | 10 | 48 |
| [utils/types/app_types.ts](/utils/types/app_types.ts) | TypeScript | 30 | 0 | 4 | 34 |
| [utils/types/undo_types.ts](/utils/types/undo_types.ts) | TypeScript | 33 | 1 | 4 | 38 |
| [utils/videoToCanvas.ts](/utils/videoToCanvas.ts) | TypeScript | 54 | 7 | 13 | 74 |
| [utils/webRTCDataMessages.ts](/utils/webRTCDataMessages.ts) | TypeScript | 64 | 1 | 13 | 78 |
| [utils/webRTCNegotiate.ts](/utils/webRTCNegotiate.ts) | TypeScript | 231 | 10 | 43 | 284 |
| [utils/websocketHub.ts](/utils/websocketHub.ts) | TypeScript | 129 | 0 | 18 | 147 |
| [vite.config.ts](/vite.config.ts) | TypeScript | 5 | 1 | 2 | 8 |
| [vite.config.ts.timestamp-1723150046245-0c46481991363.mjs](/vite.config.ts.timestamp-1723150046245-0c46481991363.mjs) | JavaScript | 8 | 2 | 1 | 11 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)
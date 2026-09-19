# Villa Control — Home Assistant Floorplan

Premium interactive floorplan concept for Home Assistant, designed with Taste and reconstructed from the embedded preview contained in the supplied AutoCAD DWG.

## Demo

GitHub Pages target:

`https://donatomontrone.github.io/htmlcss-hello/`

This project is isolated on the `villa-floorplan-demo` branch so the original `main` branch is left untouched.

## What is implemented

- responsive interactive SVG floorplan
- room selection with contextual controls
- light state and brightness simulation
- blind and climate controls prepared for Home Assistant services
- Home / Night / Away scenes
- favorite devices
- day/night visual modes
- desktop, tablet and mobile layouts
- keyboard navigation and reduced-motion support
- mock Home Assistant entity mapping in `mock/entities.json`
- GitHub Actions workflow for Pages deployment

## DWG analysis

The supplied file is a valid AutoCAD 2013–2017 DWG. The runtime does not include a native DWG geometry engine, so the first frontend iteration uses the PNG preview embedded in the DWG to reconstruct the architectural silhouette.

The thumbnail clearly provides the main spatial organization, but its room labels are not readable. Room names in this demo are therefore provisional and deliberately separated from the geometry so they can be replaced without redesigning the UI.

The original DWG is **not** committed to this public branch.

## Home Assistant integration

The demo currently uses local mock state so it is safe to publish publicly. The production version can replace that state layer with Home Assistant's `hass.states`, WebSocket updates and `hass.callService()` calls while keeping the same visual layer.

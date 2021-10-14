## Walkie Talkie
This template is an extension of the Mapbox "scrollytelling" template and is meant for data journalists and digital storytellers of any kind.

<!--Full instructions on use can be found [here](http://formerspatial.com/scrolly-drive).-->

## Prerequisites
Please familiarize yourself with Mapbox's template documentation [here](https://github.com/mapbox/storytelling).

## To Run
* `npm install -g parcel-bundler` from
https://parceljs.org/getting_started.html
* clone repo
* `npm install` (`npm audit fix` if needed)
* for dev `parcel index.html`

## Making a Walkie Talkie

#### To build your own walkie talkie, content-wise you will need:
* an interview video (mp4)
* GPS route recording (gpx)
* written description blocks to present (google doc)
* (Optional, recommended) An Mapbox account, and some map layers to furhter the storytelling


## Steps

### Step 1: prepare the scrollytelling presentation content

1a. Create Copy JSON
* Create Google Doc by making a copy of [this document](https://docs.google.com/document/d/1RyXl-0C_0-Ko-Gklx1Jd1q7MA6vVFiRPJJkmsPJ4PHo/edit) and updating the text and parameters. Follow the exact formats. Refer to the [storytelling documentation](https://github.com/mapbox/storytelling).

1b. optionally, create your own visuals to further the storytelling (recommended)
* Use [map position helper](https://demos.mapbox.com/location-helper/) to generate location visualizing parameters, e.g. location.center (lon and lat).
* Follow guidance to create your own "style" on Mapbox on either given data, your created data, or your uploaded data (dataset or tileset), e.g. [.onChapterEnter] layer: park-slope opacity: 1
* customized_lowest_layer

1c. Prepare config and execute
* Make sure that the configs at the end of the Google Doc is correct. Video duration in seconds (please find out how long it is), the number of drive slides, title, byline, mapbox styles, access tokens, etc.
* Fill in `id` and `filepath` parameters in `doc.json`(id: the Google Doc document ID between "d/" and "/edit" in the link, filepath: path for your destination copy content; and make sure the doc is shared publicly)
* Run `npm run doc` to execute `fetch-doc.js` which will pull Google Doc content into your copy filepath

### Step 2: generate driving routes and interview video screenshots along the drive
2a. Prepare Video Content
* Add .mp4 video file to `data/` and `dist/` folders (note: only mp4 will work. If you have another format, use ffmpeg to convert)

2b. Prepare GPS Route Content
* Make GPX file using Open GPX Tracker ([Apple](https://apps.apple.com/app/open-gpx-tracker/id984503772), [Android](https://play.google.com/store/apps/details?id=net.osmtracker))
* Add GPX file to `data/` folder

2c. Create Image Flipbook Content and Routes JSON
* After video and GPs data are ready, run `node make-clips.js`
* This will create `routes.json` for the walking point/line and image clips in the `imgs` folder for the flipbook

### Step 3: Final checks and run
3a. Update path names in `index.js`
* Make sure that the video path (ex. vid.src = `./IMG_1234.mp4`) match your data
* Make sure that "customized_lowest_layer" variable is set to your lowest customized layer, so that the walking dot and path will show below your customized layers but be above the other map basic layers.

3b. Run project `npm run dev`


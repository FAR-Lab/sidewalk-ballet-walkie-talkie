import scrollama from 'scrollama';
import mapboxgl from 'mapbox-gl';
import turf from 'turf';
import { chapters, config } from './copy.json';
import routeData from './route.json';

let viewerImg = document.getElementById('viewerImg');
let vid = document.getElementById('vid');
vid.src = './resized_IMG_4965.mp4';
console.log(vid);
vid.onplaying = () => { vid.style.opacity = 100 };
vid.onpause = () => { vid.style.opacity = 0 };
vid.parentNode.onclick = () => vid.paused ? vid.play() : vid.pause()
const im_path = './imgs/'

const totalVideoDuration = chapters.reduce((accumulator, chapter) => {
  if (chapter.video) {
    return accumulator + parseFloat(chapter.video.duration);
  }
  return accumulator;
}, 0);

mapboxgl.accessToken = config.accessToken;

const map = new mapboxgl.Map({
  container: 'map',
  style: config.style,
  scrollZoom: false,
});

const geojsonPoint = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [

      ],
    },
  }],
};

const routelen = routeData.features[0].geometry.coordinates.length;
const imgs = routeData.features[0].properties.coordTimes.filter(img => img > 0);

console.log(routelen)

//pre-load first 20 images
window.onload = () => {
imgs.slice(0, 20).forEach((img) =>{
    console.log('loading: ' )
    const tempImg = new Image();
    tempImg.src = `${im_path}${img}.png`
    tempImg.onload = () => console.log('loaded: ', `${im_path}${img}.png`);
  });
}

const createLine = () => {
  geojsonPoint.features[0].geometry.coordinates = routeData.features[0].geometry.coordinates;
  const initPoint = turf.point(routeData.features[0].geometry.coordinates[0]);
  map.getSource('pointSource').setData(initPoint);
  map.getSource('lineSource').setData(geojsonPoint);
};

console.log(routeData.features[0].properties.coordTimes[309]);

const changeCenter = (index) => {
  // Set center to a subsample of the line, say every 10th or 25th
  const currentJson = geojsonPoint.features[0].geometry.coordinates.slice(0, index);
  // console.log(imgs[index])
  viewerImg.src = `${im_path}${imgs[index]}.png`;
  vid.currentTime = imgs[index];
  imgs.slice(index+1, index+10).forEach((img) =>{
    console.log('loading: ', img)
    const tempImg = new Image();
    tempImg.src = `${im_path}${img}.png`
    tempImg.onload = () => console.log('loaded: ', `${im_path}${img}.png`);
  });
  // vid.oncanplay = () => { vid.currentTime = imgs[index]}
  console.log(vid.currentTime);
  // const currentTimes = geojsonPoint.features[0].properties.coordTimes.slice(0, index);
  const center = geojsonPoint.features[0].geometry.coordinates[index];
  const centerX = center[0];
  const centerY = center[1];
  const movingLine = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: currentJson,
      },
    }],
  };
  const movingPoint = turf.point([centerX, centerY]);
  map.getSource('lineSource').setData(movingLine);
  map.getSource('pointSource').setData(movingPoint);
};

const layerTypes = {
  fill: ['fill-opacity'],
  line: ['line-opacity'],
  circle: ['circle-opacity', 'circle-stroke-opacity'],
  symbol: ['icon-opacity', 'text-opacity'],
  raster: ['raster-opacity'],
  'fill-extrusion': ['fill-extrusion-opacity'],
};

const alignments = {
  left: 'lefty',
  center: 'centered',
  right: 'righty',
};

const getLayerPaintType = (layer) => {
  const layerType = map.getLayer(layer).type;
  return layerTypes[layerType];
};

const setLayerOpacity = (layer) => {
  const paintProps = getLayerPaintType(layer.layer);
  paintProps.forEach((prop) => {
    map.setPaintProperty(layer.layer, prop, parseFloat(layer.opacity));
  });
};

const story = document.getElementById('story');
const features = document.createElement('div');
features.classList.add(alignments[config.alignment]);
features.setAttribute('id', 'features');

const header = document.createElement('div');

if (config.title) {
  const titleText = document.createElement('h1');
  titleText.innerText = config.title;
  header.appendChild(titleText);
}

if (config.subtitle) {
  const subtitleText = document.createElement('h2');
  subtitleText.innerText = config.subtitle;
  header.appendChild(subtitleText);
}

if (config.byline) {
  const bylineText = document.createElement('p');
  bylineText.innerText = config.byline;
  header.appendChild(bylineText);
}

if (header.innerText.length > 0) {
  header.classList.add(config.theme);
  header.setAttribute('id', 'header');
  story.appendChild(header);
}

chapters.forEach((record, idx) => {
  const container = document.createElement('div');
  const chapter = document.createElement('div');

  if (record.title) {
    const title = document.createElement('h3');
    title.innerText = record.title;
    chapter.appendChild(title);
  }

  // if (record.video) {
  //   const vid = document.createElement('video');
  //   vid.src = 'vids/slide-0.mp4';
  //   vid.className = 'righty';
  //   container.appendChild(vid);
  // }

  if (record.image) {
    const image = new Image();
    image.src = record.image;
    chapter.appendChild(image);
  }

  if (record.description) {
    const story = document.createElement('p');
    story.innerHTML = record.description;
    chapter.appendChild(story);
  }

  container.setAttribute('id', record.id);
  container.classList.add('step');
  if (idx === 0) {
    container.classList.add('active');
  }

  chapter.classList.add(config.theme);
  container.appendChild(chapter);
  features.appendChild(container);
});

story.appendChild(features);

const footer = document.createElement('div');

if (config.footer) {
  const footerText = document.createElement('p');
  footerText.innerHTML = config.footer;
  footer.appendChild(footerText);
}

if (footer.innerText.length > 0) {
  footer.classList.add(config.theme);
  footer.setAttribute('id', 'footer');
  story.appendChild(footer);
}

// instantiate the scrollama
const scroller = scrollama();

// const normalizeProgress = (stepProgress, driveSlides, routelen) => {

// };

function handleStepProgress(response) {
  vid.style.opacity = 0
  vid.pause()
  let stepProgress;
  if (response.element.id.slice(0, 5) === 'drive') {
    const driveSlideNum = parseInt(response.element.id.slice(-1), 10);
    if (driveSlideNum === 0) {
      viewerImg.style.display = "block"
      map.setLayoutProperty('animatedLine', 'visibility', 'visible');
    }
    stepProgress = Math.round(routelen * ((response.progress / config.driveSlides) + (driveSlideNum / config.driveSlides)));
    // } else {
    //   stepProgress = Math.round(response.progress * 100 + driveSlideNum * 100);
    // }
    changeCenter(stepProgress);

    // console.log(`${stepProgress}/${routelen}`);
  }
}

map.on('load', () => {
  const w = window.innerWidth;
  const initBounds = routeData.features[0].geometry.coordinates;

  // eslint-disable-next-line max-len
  // const bounds = initBounds.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(initBounds[0], initBounds[0]));

  // if (w >= 500) {
  //   map.fitBounds(bounds, {
  //     padding: {
  //       top: 150, bottom: 150, right: -100, left: 200,
  //     },
  //     duration: 0,
  //   });
  // } else {
  //   map.fitBounds(bounds, {
  //     padding: 20,
  //     duration: 0,
  //   });
  // }
  // }
  //  else {
  //   map.setZoom(followZoomLevel);
  //   map.setBearing(followBearing);
  //   map.setPitch(followPitch);
  // }

  map.addSource('lineSource', {
    type: 'geojson',
    data: geojsonPoint,
  });

  map.addSource('pointSource', {
    type: 'geojson',
    data: geojsonPoint,
  });

  map.addLayer({
    id: 'animatedLine',
    type: 'line',
    source: 'lineSource',
    paint: {
      'line-opacity': 0,
      'line-color': 'rgb(255, 255, 0)',
      'line-width': 4.5,
    },
    layout: {
      visibility: 'none',
    },
  });

  map.addLayer({
    id: 'animatedPoint',
    type: 'circle',
    source: 'pointSource',
    paint: {
      'circle-radius': 6.5,
      'circle-opacity': 0,
      'circle-color': 'rgb(255, 255, 0)',
    },
    layout: {
      // 'visibility': 'none'
    },
  });

  // setup the instance, pass callback functions
  scroller
    .setup({
      step: '.step',
      offset: 0.5,
      progress: true,
    })
    .onStepEnter((response) => {
      const chapter = chapters.find((chap) => chap.id === response.element.id);
      response.element.classList.add('active');
      if ('location' in chapter) {
        map.flyTo(chapter.location);
      }
      // if ('video' in chapter) {
      //   response.element.getElementsByClassName('righty')[0].classList.add('sticky');
      // }
      // if (config.showMarkers) {
      //   marker.setLngLat(chapter.location.center);
      // }
      if ('onChapterEnter' in chapter) {
        chapter.onChapterEnter.forEach(setLayerOpacity);
      }
    })
    .onStepExit((response) => {
      const chapter = chapters.find((chap) => chap.id === response.element.id);
      response.element.classList.remove('active');
      if ('onChapterExit' in chapter) {
        chapter.onChapterExit.forEach(setLayerOpacity);
      }
      // if ('video' in chapter) {
      //   console.log(response.element.getElementsByClassName('righty')[0].classList.remove('sticky'));
      // }
    })
    .onStepProgress(handleStepProgress);
  createLine();
});

// setup resize event
window.addEventListener('resize', scroller.resize);

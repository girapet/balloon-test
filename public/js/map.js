import dom from './dom.js';
import surveyArea from './survey-area.js';
import network from './network.js';

(async () => {
  const connected = await network.isAvailable();

  if (!connected) {
    dom.style(dom.get('no-connection'), { display: 'block' });
    return;
  }

  const mapElement = dom.get('map');
  dom.style(mapElement, { display: 'block' });

  const [ centerLon, centerLat ] = surveyArea.center;
  const [ minLon, minLat, maxLon, maxLat ] = surveyArea.bounds;
  
  const map = L.map(mapElement, {
    center: [centerLat, centerLon],
    zoom: 15,
    minZoom: 12,
    maxZoom: 19,
    maxBounds: [[minLat, minLon], [maxLat, maxLon]]
  });
  
  // L.tileLayer('https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  //   maxZoom: 19,
  //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Carto, OpenStreetMap</a>'
  // }).addTo(map);
  
  L.tileLayer.esri('https://nhgeodata.unh.edu/nhgeodata/rest/services/IBM/Orthophotography/MapServer', {
    maxZoom: 19,
    layers: '105',
    format: 'image/jpeg',
    transparent: false,
    attribution: '&copy; <a href="https://granit.unh.edu/">NH GRANIT</a>'
  }).addTo(map);
  
  const iconSize = [24, 24]
  const iconVisible = L.divIcon({ className: 'icon-visible', iconSize, html: 'V' });
  const iconNotVisible = L.divIcon({ className: 'icon-not-visible', iconSize, html: 'X' });

  const res = await fetch('/api/list');
  const entries = await res.json();
  
  entries.forEach((submission) => {
    const time = new Date(submission.time).toLocaleString().replace(',', '');
    const visibility = submission.isVisible ? 'Visible' : 'Not Visible';
    const popup = dom.create('div');
    popup.innerHTML = `<b>${visibility}</b><br/>${submission.userName}<br/>${time}<br/>`;
    
    if (submission.hasImage) {
      const popupImage = new Image();
      popup.appendChild(popupImage);
      const downloadImage = new Image();
      downloadImage.onload = function(){
        popupImage.width = 300;
        popupImage.height = Math.round(popupImage.width * downloadImage.naturalHeight / downloadImage.naturalWidth);
        popupImage.src = downloadImage.src;   
      };
      downloadImage.src = `/api/image/${submission.id}`;
    }

    const marker = L.marker([submission.latitude, submission.longitude], {
      icon: submission.isVisible ? iconVisible : iconNotVisible
    });
    marker.bindPopup(popup);
    marker.addTo(map);
  });
})();

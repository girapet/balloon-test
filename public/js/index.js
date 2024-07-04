import dom from './dom.js';
import surveyArea from './survey-area.js';
import dataStore from './data-store.js';
import network from './network.js';

const userNameInput = dom.get('user-name');
const isVisibleRadio = dom.get('is-visible');
const isNotVisibleRadio = dom.get('is-not-visible');
const pictureDialog = dom.get('picture-dialog');
const pictureVideo = dom.get('picture-video');
const pictureCanvas = dom.get('picture-canvas');
const pictureContext = pictureCanvas.getContext('2d');
const successDialog = dom.get('success-dialog');
const queueStatus = dom.get('queue-status');

let videoStreaming = false;
const pictureWidth = 300;
let pictureHeight = 400;
let pictureTaken = false;
let sendHandle;

const showError = (errorText) => {
  dom.get('error-message').innerText = errorText;
  dom.style(dom.get('error'), { display: 'block' });
};

const checkInsideSurveyArea = (lon, lat) => {
  const inside = surveyArea.isInside([lon, lat]);
  
  if (!inside) {
    showError(`You are not currently inside the survey area.  You must be within ${surveyArea.radius} miles of Island Pond.`);
  }

  return inside;
};

const outsideDialogClose = (dialog, event) => {
  const { clientX, clientY, target } = event;

  if (target.tagName === 'DIALOG') {
    const { left, top, width, height } = dialog.getBoundingClientRect();

    if (clientX < left || left + width < clientX || clientY < top || top + height < clientY) {
      dialog.close();
    }
  }
};

const openPictureDialog = () => {
  if (!videoStreaming) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then((stream) => {
      pictureVideo.srcObject = stream;
      pictureVideo.play();
    });
  }

  pictureDialog.showModal();
};

const startVideo = () => {
  if (!videoStreaming) {
    pictureHeight = Math.round(pictureWidth * pictureVideo.videoHeight / pictureVideo.videoWidth);
    dom.style(pictureVideo, { height: `${pictureHeight}px` });
    dom.style(pictureCanvas, { width: `${pictureWidth}px`, height: `${pictureHeight}px` });
    videoStreaming = true;
  }
};

const takePicture = (event) => {
  pictureCanvas.width = pictureVideo.videoWidth;
  pictureCanvas.height = pictureVideo.videoHeight;
  dom.style(pictureCanvas, { display: 'block', width: `${pictureWidth}px`, height: `${pictureHeight}px` });

  pictureContext.drawImage(pictureVideo, 0, 0, pictureVideo.videoWidth, pictureVideo.videoHeight);
  pictureTaken = true;
  pictureDialog.close();
  event.preventDefault();
};

const blobToBase64 = (blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result.replace('data:image/jpeg;base64,', ''));
    };
  });
};

const queueSubmission = async (submission) => {
  await dataStore.add(submission);
  sendSubmissions();

  dom.style(pictureCanvas, { display: 'none' });
  isVisibleRadio.checked = false;
  isNotVisibleRadio.checked = true;
  
  successDialog.showModal();
};

const submitSurvey = (event) => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { longitude, latitude } = position.coords;

    if (!checkInsideSurveyArea(longitude, latitude)) {
      return;
    }

    const submission = {
      userName: userNameInput.value,
      time: new Date().valueOf(),
      longitude, 
      latitude,
      isVisible: isVisibleRadio.checked,
    };

    if (pictureTaken) {
      pictureCanvas.toBlob((image) => {
        (async () => {
          submission.image = await blobToBase64(image);
          await queueSubmission(submission);
        })();
      }, 'image/jpeg', 0.95)
    }
    else {
      await queueSubmission(submission);
    }
  });

  event.preventDefault();
};

const sendSubmissions = () => {
  if (sendHandle) {
    clearTimeout(sendHandle);
    sendHandle = undefined;
  }

  (async () => {
    const count = await dataStore.count();

    if (count) {
      const connected = await network.isAvailable();

      if (!connected) {
        queueStatus.innerText = `${count} submission${count > 1 ? 's' : ''} queued, waiting for an internet connection`;
        sendHandle = setTimeout(sendSubmissions, 10000);
        return;
      }

      await dataStore.send();
      queueStatus.innerText = '';
    }
  })();
};

const initialize = () => {
  userNameInput.value = window.localStorage.getItem('user-name');
  dom.style(dom.get('survey'), { display: 'block' });

  dom.on(userNameInput, 'keyup', () => window.localStorage.setItem('user-name', userNameInput.value));
  dom.on(dom.get('picture-start'), 'click', openPictureDialog);
  dom.on(pictureVideo, 'canplay', startVideo)
  dom.on(dom.get('picture-take'), 'click', takePicture);
  dom.on(dom.get('submit'), 'click', submitSurvey);
  dom.on(pictureDialog, 'click', (event) => outsideDialogClose(pictureDialog, event));
  dom.on(successDialog, 'click', (event) => outsideDialogClose(successDialog, event));
};

navigator.geolocation.getCurrentPosition((position) => {
  const { longitude, latitude } = position.coords;

  if (checkInsideSurveyArea(longitude, latitude)) {
    initialize();
  }
}, () => {
  showError('No GPS detected.  You must turn on GPS to use this survey.');
});

sendSubmissions();
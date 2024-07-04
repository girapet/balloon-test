## Island Pond Cell Tower Balloon Test

A resident of Stoddard, NH wants to erect a cell tower which may be visible from properties on Island Pond.  The town's Zoning Board has ordered a balloon test to check the visibility of the proposed tower.

This web app collects balloon observations, sends them to a common database, and shows them on a map.

#### Features

* Uses a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) to precache several of the web app files, allowing for offline use.
* Observations are written to [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB).  When an internet connection becomes available, the observations are transferred to the backend.
* Internet connectivity is checked by sending a HEAD request for a test file.
* Uses the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API) to acquire the collecting device's location.
* Uses the [Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) to show the view from the device's camera and capture a photo image.
* Displays results on a [Leaflet](https://leafletjs.com/) map.  The map background is aerial imagery from [NH GRANIT](https://granit.unh.edu/).
* Saves observations in [GCP Cloud Datastore](https://cloud.google.com/datastore/docs/concepts/overview) and photos in [GCP Cloud Storage](https://cloud.google.com/storage/docs/introduction).
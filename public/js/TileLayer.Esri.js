(() => {
  const TileLayerEsri = L.TileLayer.extend({
    defaultEsriParams: {
      layers: '',
      format: 'png',
      transparent: true,
      f: 'image'
    },
  
    options: {
      crs: null,
    },
  
    initialize: function (url, options) {
      this._url = url;
  
      const esriParams = L.Util.extend({}, this.defaultEsriParams);
  
      for (let o in options) {
        if (!(o in this.options)) {
          esriParams[o] = options[o];
        }
      }
  
      options = L.Util.setOptions(this, options);
  
      const isRetina = options.detectRetina && Browser.retina;
      const realRetina = isRetina ? 2 : 1;
      const tileSize = this.getTileSize();
      esriParams.size = [tileSize.x * realRetina, tileSize.y * realRetina].join();
  
      if (isRetina) {
        esriParams.dpi = 192;
      }
  
      const { layers } = esriParams;
  
      if (!layers.startsWith('show:') && !layers.startsWith('hide:') && !layers.startsWith('include:') && !layers.startsWith('exclude:')) {
        esriParams.layers = `show:${layers}`;
      }
  
      if (esriParams.format === 'image/png') esriParams.format = 'png';
      if (esriParams.format === 'image/jpeg') esriParams.format = 'jpg';
  
      this.esriParams = esriParams;
    },
  
    onAdd: function (map) {
      this._crs = this.options.crs || map.options.crs;
  
      const { esriParams } = this;
      const srParts = this._crs.code.split(':');
      const sr = parseInt(srParts[1], 10);
      esriParams.bboxSR = sr;
      esriParams.imageSR = sr;
  
      L.TileLayer.prototype.onAdd.call(this, map);
    },
  
    getTileUrl: function (coords) {
      const tileBounds = this._tileCoordsToNwSe(coords);
      const crs = this._crs;
      const bounds = new L.Bounds(crs.project(tileBounds[0]), crs.project(tileBounds[1]));
      const { min, max } = bounds;
      const bbox = [min.x, min.y, max.x, max.y].join(',');
      const url = L.TileLayer.prototype.getTileUrl.call(this, coords);
      const paramString = L.Util.getParamString(this.esriParams, url, false);
      return `${url}/export${paramString}&bbox=${bbox}`;
    }
  });
  
  L.TileLayer.Esri = TileLayerEsri;
  L.tileLayer.esri = (url, options) => new TileLayerEsri(url, options);
})();

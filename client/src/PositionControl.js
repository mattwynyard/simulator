import L from 'leaflet'

L.PositionControl = L.Control.extend({
    _container: null,
        options: {
          position: 'bottomleft'
        },
      
    onAdd: function () {
        let latlng = L.DomUtil.create('span', 'mouseposition', L.DomUtil.get('map'));
        this._container = latlng
        return latlng;
    },

    updateHTML: function(lat, lng) {
        var latlng = lat + " " + lng
        this._container.innerHTML = "LatLng: " + latlng;
    }
});

L.positionControl = () => {
    return new L.PositionControl();
};
import { TileLayer } from 'react-leaflet';

function CustomTileLayer(props) {
    if (props.isRemote) {
      return (
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="/auckland/{z}/{x}/{y}.png"
        />
      );
    } else {
      return (
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      );
    }
  }

  export default CustomTileLayer;
export const REGISTRY_FEEDS = [
  {
    id: 'eyeroll-shibuya',
    name: 'Eyeroll: Shibuya Crossing Live (Tokyo, JP)',
    region: 'Eyeroll',
    type: 'hls',
    lat: 35.6595,
    lon: 139.7005,
    url: 'https://stream.mux.com/v69Un5bgAkepRERC00AQgahN014rwqlHOG.m3u8'
  },
  {
    id: 'eyeroll-times-sq',
    name: 'Eyeroll: Times Square 4K Pan (NYC, US)',
    region: 'Eyeroll',
    type: 'hls',
    lat: 40.7580,
    lon: -73.9855,
    url: 'https://cdn-002.whatsupcams.com/hls/us_nyctimessquare1.m3u8'
  },
  {
    id: 'eyeroll-amsterdam',
    name: 'Eyeroll: Dam Square Live (Amsterdam, NL)',
    region: 'Eyeroll',
    type: 'image',
    lat: 52.3731,
    lon: 4.8926,
    url: 'https://webcam.amsterdam.nl/cams/damsquare.jpg'
  },
  {
    id: 'nyc-1',
    name: 'NYCDOT: Broadway & 42nd St',
    region: 'NYCDOT',
    type: 'image',
    lat: 40.7558,
    lon: -73.9864,
    url: 'https://webcams.nyctmc.org/api/cameras/67d64388-3ef0-4d55-8d54-8e10dcf75765/image'
  },
  {
    id: 'bc-1',
    name: 'DriveBC: Hwy 1 at Ironworkers',
    region: 'DriveBC',
    type: 'image',
    lat: 49.3005,
    lon: -123.0272,
    url: 'https://www.drivebc.ca/images/1.jpg'
  },
  {
    id: 'tx-1',
    name: 'TxDOT: Austin I-35 at 6th St',
    region: 'TxDOT',
    type: 'image',
    lat: 30.2672,
    lon: -97.7333,
    url: 'https://its.txdot.gov/its/cctv/austin/cam1.jpg'
  }
];

export class CameraService {
  static async loadAllCameras() {
    let cameras = [...REGISTRY_FEEDS];
    try {
      const res = await fetch('/config/eyeroll_sources.json');
      if (res.ok) {
        const external = await res.json();
        cameras = [...cameras, ...external];
      }
    } catch {}
    return cameras;
  }

  static getProxiedUrl(url) {
    return url || '';
  }
}

/**
 * Historical tornado outbreak scenarios
 *
 * Each scenario can now include a "layers" array.
 * Each layer has:
 *   id, name, group, url (image URL or local path)
 *
 * For free static hosting:
 * - Put image files in an /images/ folder in the repo
 * - Reference them as "images/20110427_surface.png"
 * - Or use public direct image links if available
 *
 * Currently most layers are placeholders so the UI works.
 * Replace the urls with real historical plots as you collect them.
 */

const SCENARIOS = [
  {
    id: "20110427",
    name: "2011 Super Outbreak (Peak Day)",
    date: "April 27, 2011",
    monthHint: "April",
    center: [34.0, -87.0],
    zoom: 6,
    reports: [
      { lat: 33.2098, lon: -87.5692, rating: "EF4", comment: "Tuscaloosa–Birmingham" },
      { lat: 34.2800, lon: -87.7300, rating: "EF5", comment: "Hackleburg–Phil Campbell" },
      { lat: 34.7300, lon: -86.5900, rating: "EF4", comment: "Near Huntsville area" },
      { lat: 33.4500, lon: -88.8200, rating: "EF5", comment: "Smithville, MS" },
      { lat: 35.0500, lon: -85.3000, rating: "EF4", comment: "Ringgold / NW GA" },
      { lat: 35.9600, lon: -83.9200, rating: "EF3", comment: "East Tennessee" },
      { lat: 32.3500, lon: -89.1000, rating: "EF3", comment: "Central Mississippi" },
      { lat: 34.6000, lon: -86.0000, rating: "EF3", comment: "Northern Alabama" }
    ],
    layers: [
      { id: "sfc", name: "12z Surface Analysis", group: "WPC Surface", url: null },
      { id: "temp", name: "Temp/Dewpoint", group: "SPC Surface", url: null },
      { id: "mslp", name: "MSL Pressure/Wind", group: "SPC Surface", url: null },
      { id: "850", name: "850mb Analysis", group: "SPC Upper Air", url: null },
      { id: "500", name: "500mb Analysis", group: "SPC Upper Air", url: null },
      { id: "shear", name: "0-6km Shear", group: "SPC Shear", url: null },
      { id: "stp", name: "Significant Tornado Parameter", group: "Composites", url: null }
    ]
  },
  {
    id: "19740403",
    name: "1974 Super Outbreak",
    date: "April 3, 1974",
    monthHint: "April",
    center: [38.0, -85.5],
    zoom: 6,
    reports: [
      { lat: 39.1000, lon: -84.5000, rating: "F5", comment: "Xenia, OH area" },
      { lat: 38.2500, lon: -85.7500, rating: "F4", comment: "Louisville area" },
      { lat: 39.1600, lon: -86.5300, rating: "F4", comment: "Central Indiana" },
      { lat: 36.1600, lon: -86.7800, rating: "F3", comment: "Middle Tennessee" },
      { lat: 37.0000, lon: -88.5000, rating: "F4", comment: "Western Kentucky" },
      { lat: 40.4000, lon: -80.0000, rating: "F3", comment: "Western Pennsylvania" }
    ],
    layers: [
      { id: "sfc", name: "Surface Analysis", group: "WPC Surface", url: null },
      { id: "500", name: "500mb Analysis", group: "SPC Upper Air", url: null },
      { id: "shear", name: "0-6km Shear", group: "SPC Shear", url: null }
    ]
  },
  {
    id: "20110522",
    name: "Joplin EF5",
    date: "May 22, 2011",
    monthHint: "May",
    center: [37.1, -94.5],
    zoom: 8,
    reports: [
      { lat: 37.0842, lon: -94.5133, rating: "EF5", comment: "Joplin, MO" },
      { lat: 37.0500, lon: -94.4000, rating: "EF2", comment: "East of Joplin" },
      { lat: 36.9500, lon: -94.8000, rating: "EF1", comment: "Nearby activity" }
    ],
    layers: [
      { id: "sfc", name: "12z Surface Analysis", group: "WPC Surface", url: null },
      { id: "500", name: "500mb Analysis", group: "SPC Upper Air", url: null },
      { id: "stp", name: "Significant Tornado Parameter", group: "Composites", url: null }
    ]
  },
  {
    id: "19990503",
    name: "1999 Oklahoma Outbreak",
    date: "May 3, 1999",
    monthHint: "May",
    center: [35.4, -97.5],
    zoom: 7,
    reports: [
      { lat: 35.4676, lon: -97.5164, rating: "F5", comment: "Bridge Creek–Moore" },
      { lat: 35.2200, lon: -97.4400, rating: "F4", comment: "Southern Oklahoma City metro" },
      { lat: 35.6000, lon: -97.2000, rating: "F3", comment: "Northeast of OKC" },
      { lat: 34.9000, lon: -97.9000, rating: "F3", comment: "Southwest of metro" }
    ],
    layers: [
      { id: "sfc", name: "Surface Analysis", group: "WPC Surface", url: null },
      { id: "850", name: "850mb Analysis", group: "SPC Upper Air", url: null },
      { id: "500", name: "500mb Analysis", group: "SPC Upper Air", url: null },
      { id: "shear", name: "0-6km Shear", group: "SPC Shear", url: null }
    ]
  },
  {
    id: "20080205",
    name: "Super Tuesday 2008",
    date: "February 5–6, 2008",
    monthHint: "February",
    center: [35.5, -89.0],
    zoom: 6,
    reports: [
      { lat: 35.1500, lon: -90.0500, rating: "EF4", comment: "Memphis metro" },
      { lat: 35.6500, lon: -88.8000, rating: "EF3", comment: "Jackson, TN area" },
      { lat: 36.2000, lon: -86.8000, rating: "EF3", comment: "Nashville area" },
      { lat: 34.7000, lon: -92.3000, rating: "EF3", comment: "Central Arkansas" }
    ],
    layers: [
      { id: "sfc", name: "Surface Analysis", group: "WPC Surface", url: null },
      { id: "500", name: "500mb Analysis", group: "SPC Upper Air", url: null }
    ]
  },
  {
    id: "20201210",
    name: "December 2021 Midwest / KY",
    date: "December 10–11, 2021",
    monthHint: "December",
    center: [37.0, -88.5],
    zoom: 6,
    reports: [
      { lat: 36.8500, lon: -87.5000, rating: "EF4", comment: "Mayfield / western KY" },
      { lat: 37.1000, lon: -88.6000, rating: "EF3", comment: "Western Kentucky" },
      { lat: 36.3000, lon: -89.0000, rating: "EF3", comment: "NW Tennessee / MO bootheel" },
      { lat: 38.6000, lon: -90.2000, rating: "EF3", comment: "St. Louis area activity" }
    ],
    layers: [
      { id: "sfc", name: "Surface Analysis", group: "WPC Surface", url: null },
      { id: "500", name: "500mb Analysis", group: "SPC Upper Air", url: null },
      { id: "shear", name: "0-6km Shear", group: "SPC Shear", url: null }
    ]
  }
];

// Load Sentinel-2 image collection
var s2 = ee.ImageCollection("COPERNICUS/S2")
          .filterBounds(ee.Geometry.Point([69.2401, 41.2995])) // Center point of Tashkent
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

// Define Tashkent boundary (use an approximate boundary or upload a specific Tashkent boundary if available)
var uzbekistan = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
                   .filter(ee.Filter.eq('country_na', 'Uzbekistan'));

// Approximate boundary of Tashkent using a buffer
var tashkentPoint = ee.Geometry.Point([69.2401, 41.2995]);
var tashkentBoundary = tashkentPoint.buffer(20000); // 20 km buffer for Tashkent area

// Function to calculate NDVI
function calculateNDVI(image) {
  return image.normalizedDifference(['B8', 'B4']).rename('NDVI'); // NIR (B8) and Red (B4) bands
}

// Loop through each year from 2018 to the current year
var startYear = 2018;
var endYear = new Date().getFullYear();

for (var year = startYear; year <= endYear; year++) {
  // Filter collection for March of the current year
  var start = ee.Date.fromYMD(year, 3, 1);
  var end = ee.Date.fromYMD(year, 3, 31);
  var filteredCollection = s2.filterDate(start, end).map(calculateNDVI);
  
  // Create a median composite to reduce noise
  var ndviComposite = filteredCollection.median().clip(tashkentBoundary); // Clip to Tashkent boundary
  
  // Visualization parameters for black-to-green palette
  var ndviParams = {
    bands: ['NDVI'],
    min: 0,
    max: 1,
    palette: ['black', 'green']
  };
  
  // Add layer to map (optional, for preview)
  Map.addLayer(ndviComposite, ndviParams, 'NDVI ' + year);

  // Export the image to Google Drive
  Export.image.toDrive({
    image: ndviComposite,
    description: 'NDVI_Tashkent_' + year,
    folder: 'GEE_NDVI_exports', // Specify your Google Drive folder
    fileNamePrefix: 'NDVI_Tashkent_' + year,
    scale: 30, // Sentinel-2 resolution
    region: tashkentBoundary.bounds(),
    maxPixels: 1e13
  });
}

// Center map on Tashkent for preview
Map.setCenter(69.2401, 41.2995, 10);

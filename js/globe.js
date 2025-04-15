// Dimensions for the globe
const width = 400, height = 400;
const svg = d3.select("#globe").attr("width", width).attr("height", height);

// Precise coordinate for Pakistan (Islamabad)
const pakistan = { name: "Pakistan", coords: [70, 33] };

// European destinations
const europeanDestinations = [
  { name: "", coords: [-12.2137, 53.6034] },
  { name: "", coords: [-13.2137, 50.6034] },
  { name: "", coords: [-22.2137, 50.6034] },
  { name: "", coords: [-22.2137, 55.6034] },
  { name: "Europe",       coords: [-30.2137, 50.6034] }
];

// Calculate rotation for centering on Pakistan.
const rotation = [-pakistan.coords[0] + 60, -pakistan.coords[1] + 3];

// Create an orthographic projection for the globe (with clipping)
const projection = d3.geoOrthographic()
  .scale(180)
  .translate([width / 2, height / 2])
  .rotate(rotation)
  .clipAngle(90);

// Create a separate projection for flight arcs (with clipping disabled)
const arcProjection = d3.geoOrthographic()
  .scale(180)
  .translate([width / 2, height / 2])
  .rotate(rotation)
  .clipAngle(180); // Disable clipping for arcs

const path = d3.geoPath().projection(projection);

// Draw the textured sphere with an enhanced glowing outline.
svg.append("path")
  .datum({ type: "Sphere" })
  .attr("d", path)
  .attr("fill", "url(#earthTexture)")
  .attr("stroke", "#fff")
  .attr("stroke-width", 2)
  .attr("filter", "url(#glow)");

// Function to draw a 3D-like flight path using a cubic Bezier curve.
function drawShinyArc(start, dest) {
  // Use arcProjection to avoid clipping the arcs
  const startScreen = arcProjection(start);
  const destScreen = arcProjection(dest);

  // Calculate the vector from start to destination
  const dx = destScreen[0] - startScreen[0];
  const dy = destScreen[1] - startScreen[1];

  // Perpendicular vector for the arc “lift”
  let perpX = -dy;
  let perpY = dx;
  const len = Math.sqrt(perpX * perpX + perpY * perpY);
  perpX /= len;
  perpY /= len;

  // Control points for the cubic Bezier curve.
  const arcHeight1 = 250;
  const arcHeight2 = 100;

  // Control point 1: roughly 1/3 of the way, then shifted along the perpendicular.
  const cp1x = startScreen[0] + dx / 3 + perpX * arcHeight1;
  const cp1y = startScreen[1] + dy / 3 + perpY * arcHeight1;

  // Control point 2: roughly 2/3 of the way, then shifted along the perpendicular.
  const cp2x = startScreen[0] + (2 * dx) / 3 + perpX * arcHeight2;
  const cp2y = startScreen[1] + (2 * dy) / 3 + perpY * arcHeight2;

  // Create the cubic Bezier path
  const dPath = `
    M${startScreen[0]},${startScreen[1]}
    C${cp1x},${cp1y}
     ${cp2x},${cp2y}
     ${destScreen[0]},${destScreen[1]}
  `;

  svg.append("path")
    .attr("class", "flight") // <-- Add this class
    .attr("d", dPath)
    .attr("fill", "none")
    .attr("stroke", "#ffcc00")
    .attr("stroke-width", 1)
    .attr("stroke-linecap", "round")
    .attr("filter", "url(#glow)");
}

// Draw the flight paths from Pakistan to each European destination.
europeanDestinations.forEach(dest => {
  drawShinyArc(pakistan.coords, dest.coords);
});

// Function to add a label with an offset.
function addLabel(coord, text, offsetX = 5, offsetY = 5) {
  const [x, y] = projection(coord);
  svg.append("text")
     .attr("x", x + offsetX)
     .attr("y", y + offsetY)
     .attr("class", "label")
     .attr("fill", "white")  // Change "red" to any color you prefer
     .text(text);
}

// Add labels for Pakistan and each destination.
addLabel(pakistan.coords, pakistan.name, 5, -5);
europeanDestinations.forEach(dest => {
  let offsetX = 5, offsetY = 5;
  const proj = projection(dest.coords);
  if (proj[0] < width / 2) offsetX = -45;
  if (proj[1] < height / 2) offsetY = -5;
  addLabel(dest.coords, dest.name, offsetX, offsetY);
});

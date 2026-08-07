const fs = require('fs');
const file = '/app/applet/services/sceneBuilder.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`    const baseScale2D = 0.5;
    const finalScale2D = baseScale2D * \${imageZoom};
    const pixelsPerUnit = (img.width * finalScale2D) / w;
    
    const panUnitX = -(\${imagePanX}) / pixelsPerUnit;
    const panUnitY = (\${imagePanY}) / pixelsPerUnit;
    const distToFront = window.innerHeight / (2 * Math.tan(22.5 * Math.PI / 180) * pixelsPerUnit);
    
    camera.position.set(panUnitX, panUnitY, distToFront + (THICKNESS / 2));
    controls.target.set(panUnitX, panUnitY, 0);
    controls.update();`,
`    const baseScale2D = 0.5;
    const finalScale2D = baseScale2D * \${imageZoom};
    const pixelsPerUnit = (img.width * finalScale2D) / w;
    
    const distToFront = window.innerHeight / (2 * Math.tan(22.5 * Math.PI / 180) * pixelsPerUnit);
    
    camera.position.set(0, 0, distToFront + (THICKNESS / 2));
    controls.target.set(0, 0, 0);
    camera.setViewOffset(
      window.innerWidth, window.innerHeight,
      -(\${imagePanX}), -(\${imagePanY}),
      window.innerWidth, window.innerHeight
    );
    controls.update();`
);
fs.writeFileSync(file, content);

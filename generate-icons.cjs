const fs = require('fs');
const path = require('path');
const si = require('simple-icons');

const svgDir = path.join(__dirname, 'src', 'SVG');
if (!fs.existsSync(svgDir)) fs.mkdirSync(svgDir, { recursive: true });

function convertToReact(name, siIcon) {
  let svg = siIcon.svg;
  // Replace svg attributes to accept props
  svg = svg.replace('<svg', '<svg width={width} height={height} className={className}');
  
  // simple-icons SVG doesn't have a fill attribute, it uses default. We add fill
  svg = svg.replace('<path', '<path fill="#' + siIcon.hex + '"');

  const content = `import React from 'react';

const ${name} = ({ width, height, className }: { width?: number; height?: number; className?: string }) => {
  return (
    ${svg}
  );
};

export default ${name};
`;
  fs.writeFileSync(path.join(svgDir, name + '.tsx'), content);
}

convertToReact('GithubDesktop', si.siGithub);
convertToReact('Termius', si.siTermius);
convertToReact('Ubisoft', si.siUbisoft);
convertToReact('Inkscape', si.siInkscape);
convertToReact('ObsStudio', si.siObsstudio);

console.log('Generated simple-icons components.');

// For LightShot, Everything, WinRAR, let's create components that use Google favicon as img tags.

function createImgReact(name, url) {
  const content = `import React from 'react';

const ${name} = ({ width, height, className }: { width?: number; height?: number; className?: string }) => {
  return (
    <img src="${url}" width={width} height={height} className={className} alt="${name}" />
  );
};

export default ${name};
`;
  fs.writeFileSync(path.join(svgDir, name + '.tsx'), content);
}

createImgReact('Lightshot', 'https://www.google.com/s2/favicons?domain=app.prntscr.com&sz=128');
createImgReact('Everything', 'https://www.google.com/s2/favicons?domain=voidtools.com&sz=128');
createImgReact('Winrar', 'https://www.google.com/s2/favicons?domain=win-rar.com&sz=128');

console.log('Generated img components for remaining icons.');

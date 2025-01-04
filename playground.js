function applyTheme(themePath) {
  const stylesheet = document.getElementById('widget-stylesheet');
  const widgetContainer = document.getElementById('widget-container');
  const downloadLink = document.getElementById('download-css');
  const themeColors = {
    'themes/clean.css': '#FFFFFF',
    'themes/frontier.css': '#FAF9F7',
    'themes/peony.css': '#FCFAF9',
    'themes/stellar.css': '#1B1E3C',
    'themes/vesper.css': '#0C141C',
  };
  const themeLinkStyles = {
    'themes/clean.css': { color: '#3D40EF', textDecoration: 'none' },
    'themes/frontier.css': { color: '#8B5E3C', textDecoration: 'none' },
    'themes/peony.css': { color: '#725664', textDecoration: 'none' },
    'themes/stellar.css': { color: '#F435AB', textDecoration: 'none' },
    'themes/vesper.css': { color: '#81FAE4', textDecoration: 'none' },
  };

  if (stylesheet && widgetContainer && downloadLink) {
    stylesheet.href = themePath;
    const bgColor = themeColors[themePath] || '#FFFFFF';
    widgetContainer.style.backgroundColor = bgColor;

    // Update download link
    downloadLink.href = themePath;
    const linkStyles = themeLinkStyles[themePath] || { color: 'black', textDecoration: 'none' };
    Object.assign(downloadLink.style, linkStyles);
  } else {
    console.error('Widget stylesheet or container not found.');
  }
}

function resetStyles() {
  const stylesheet = document.getElementById('widget-stylesheet');
  const widgetContainer = document.getElementById('widget-container');
  const downloadLink = document.getElementById('download-css');

  if (stylesheet && widgetContainer && downloadLink) {
    stylesheet.href = 'themes/original.css';
    widgetContainer.style.backgroundColor = 'white';

    downloadLink.href = 'themes/original.css';
    downloadLink.style.color = 'black';
    downloadLink.style.textDecoration = 'none';
  } else {
    console.error('Widget stylesheet or container not found.');
  }
}

document.addEventListener('DOMContentLoaded', function() {
    var year = new Date().getFullYear();
    document.getElementById('year').textContent = year;
});
const http = require('http');

http.get('http://localhost:4022/login', (res) => {
  let html = '';
  res.on('data', (chunk) => html += chunk);
  res.on('end', () => {
    const m = html.match(/_next\/static\/css\/[^"']*\.css[^"']*/);
    if(m) {
      console.log('CSS URL:', m[0]);
      http.get('http://localhost:4022/' + m[0], (cssRes) => {
        let css = '';
        cssRes.on('data', (chunk) => css += chunk);
        cssRes.on('end', () => {
          console.log('CSS Length:', css.length);
          console.log('Includes bg-indigo-500:', css.includes('bg-indigo-500'));
          console.log('Includes text-white:', css.includes('text-white'));
          console.log('Includes premium-glass:', css.includes('premium-glass'));
          console.log(css.substring(0, 100));
        });
      });
    } else {
      console.log('No CSS path found in HTML');
    }
  });
});

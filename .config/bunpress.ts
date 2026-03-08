import type { BunPressOptions } from '@stacksjs/bunpress'

const config: BunPressOptions = {
  name: 'ts-charts',
  description: 'A complete TypeScript rewrite of D3.js — 30 packages in a Bun-first monorepo with zero external dependencies.',
  url: 'https://ts-charts.stacksjs.com',

  theme: {
    primaryColor: '#3b82f6',
  },

  nav: [
    { text: 'Guide', link: '/guide/getting-started' },
    { text: 'API Reference', link: '/api/overview' },
    {
      text: 'Stacks',
      items: [
        { text: 'Stacks Framework', link: 'https://stacksjs.com' },
        { text: 'BunPress', link: 'https://bunpress.sh' },
        { text: 'dtsx', link: 'https://dtsx.stacksjs.com' },
      ],
    },
    { text: 'GitHub', link: 'https://github.com/stacksjs/ts-charts' },
  ],

  sidebar: [
    {
      text: 'Introduction',
      items: [
        { text: 'What is ts-charts?', link: '/intro' },
        { text: 'Installation', link: '/install' },
        { text: 'Usage', link: '/usage' },
        { text: 'Configuration', link: '/config' },
      ],
    },
    {
      text: 'Guide',
      items: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Why ts-charts?', link: '/guide/why' },
        { text: 'Selections', link: '/guide/selections' },
        { text: 'Data Joins', link: '/guide/data-joins' },
        { text: 'Transitions', link: '/guide/transitions' },
        { text: 'Scales', link: '/guide/scales' },
        { text: 'Shapes', link: '/guide/shapes' },
      ],
    },
    {
      text: 'Features',
      items: [
        { text: 'Type Safety', link: '/features/type-safety' },
        { text: 'Color Spaces', link: '/features/color-spaces' },
        { text: 'Data Processing', link: '/features/data-processing' },
        { text: 'Geographic', link: '/features/geographic' },
        { text: 'Layouts', link: '/features/layouts' },
        { text: 'Interactions', link: '/features/interactions' },
      ],
    },
    {
      text: 'Advanced',
      items: [
        { text: 'Tree Shaking', link: '/advanced/tree-shaking' },
        { text: 'Migration from D3', link: '/advanced/migration-from-d3' },
        { text: 'Browser Support', link: '/advanced/browser-support' },
        { text: 'Custom Builds', link: '/advanced/custom-builds' },
        { text: 'Testing', link: '/advanced/testing' },
      ],
    },
    {
      text: 'API Reference',
      items: [
        { text: 'Overview', link: '/api/overview' },
        { text: 'Array', link: '/api/array' },
        { text: 'Axis', link: '/api/axis' },
        { text: 'Brush', link: '/api/brush' },
        { text: 'Chord', link: '/api/chord' },
        { text: 'Color', link: '/api/color' },
        { text: 'Contour', link: '/api/contour' },
        { text: 'Delaunay', link: '/api/delaunay' },
        { text: 'Dispatch', link: '/api/dispatch' },
        { text: 'Drag', link: '/api/drag' },
        { text: 'DSV', link: '/api/dsv' },
        { text: 'Ease', link: '/api/ease' },
        { text: 'Fetch', link: '/api/fetch' },
        { text: 'Force', link: '/api/force' },
        { text: 'Format', link: '/api/format' },
        { text: 'Geo', link: '/api/geo' },
        { text: 'Hierarchy', link: '/api/hierarchy' },
        { text: 'Interpolate', link: '/api/interpolate' },
        { text: 'Path', link: '/api/path' },
        { text: 'Polygon', link: '/api/polygon' },
        { text: 'Quadtree', link: '/api/quadtree' },
        { text: 'Random', link: '/api/random' },
        { text: 'Scale', link: '/api/scale' },
        { text: 'Scale Chromatic', link: '/api/scale-chromatic' },
        { text: 'Selection', link: '/api/selection' },
        { text: 'Shape', link: '/api/shape' },
        { text: 'Time', link: '/api/time' },
        { text: 'Time Format', link: '/api/time-format' },
        { text: 'Timer', link: '/api/timer' },
        { text: 'Transition', link: '/api/transition' },
        { text: 'Zoom', link: '/api/zoom' },
      ],
    },
    {
      text: 'Community',
      items: [
        { text: 'Team', link: '/team' },
        { text: 'Sponsors', link: '/sponsors' },
        { text: 'Partners', link: '/partners' },
        { text: 'Showcase', link: '/showcase' },
        { text: 'Stargazers', link: '/stargazers' },
        { text: 'Postcardware', link: '/postcardware' },
        { text: 'License', link: '/license' },
      ],
    },
  ],

  socialLinks: [
    { icon: 'github', url: 'https://github.com/stacksjs/ts-charts' },
  ],

  sitemap: {
    enabled: true,
    baseUrl: 'https://ts-charts.stacksjs.com',
  },

  robots: {
    enabled: true,
  },
}

export default config

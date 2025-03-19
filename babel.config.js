module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        test: /node_modules[\/\\]expo[\/\\]/,
        plugins: [
          ['@babel/plugin-transform-typescript', { allowNamespaces: true, isTSX: false, allExtensions: true }]
        ]
      }
    ]
  };
};

module.exports = {

  development: {
    assetPrefixUrl: "http://localhost:<%= appPort %>",
    hashAssets: false,
    enhance: false
  },

  test: {
    assetPrefixUrl: "",
    branch: "",
    hashAssets: false,
    fianceSearchEndpoint: "/fiance/v2/es",
    enhance: false
  },

  production: {
    assetPrefixUrl: "//d18w78eemwzu3j.cloudfront.net/<%= fullAppName %>",
    branch: "production",
    hashAssets: true,
    enhance: {
      host: '//dgj5ep7xp9u24.cloudfront.net/transform_image/qe',
      tabletAsMobile: false
    }
  }

};

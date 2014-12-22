module.exports = {

  development: {
    assetPrefixUrl: "http://localhost:<%= appPort %>",
    hashAssets: false,
    copycopter: {
      apiKey: '01234'
    },
    enhance: false
  },

  test: {
    assetPrefixUrl: "",
    branch: "",
    hashAssets: false,
    copycopter: {
      apiKey: '01234',
    },
    fianceSearchEndpoint: "/fiance/v2/es",
    enhance: false
  },

  production: {
    assetPrefixUrl: "//d18w78eemwzu3j.cloudfront.net/<%= fullAppName %>",
    branch: "production",
    hashAssets: true,
    copycopter: {
      apiKey: '170587ede056375f40369caeb02d9848',
      host:   'copycopter.crowdtap.com'
    },
    enhance: {
      host: '//dgj5ep7xp9u24.cloudfront.net/transform_image/qe',
      tabletAsMobile: false
    }
  }

};

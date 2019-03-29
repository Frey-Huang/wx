//index.js
//获取应用实例

import initChart from './weatherChart'
// import run from './getRunData'
const app = getApp()
const weatherIcon = {
    CLEAR_DAY: 'icon-CLEAR_DAY', //晴天
    CLEAR_NIGHT: 'icon-CLEAR_NIGHT', //晴夜
    PARTLY_CLOUDY_DAY: 'icon-PARTLY_CLOUDY_DAY', //多云
    PARTLY_CLOUDY_NIGHT: 'icon-PARTLY_CLOUDY_NIGHT', //多云
    CLOUDY: 'icon-CLOUDY', //阴
    LIGHT_HAZE: 'icon-HAZE', //	PM2.5 100~150
    MODERATE_HAZE: 'icon-HAZE', //PM2.5 150~200
    HEAVY_HAZE: 'icon-HAZE', //PM2.5 > 200
    LIGHT_RAIN: 'icon-LIGHT_RAIN', //小雨
    MODERATE_RAIN: 'icon-MODERATE_RAIN', //中雨
    HEAVY_RAIN: 'icon-HEAVY_RAIN', //大雨
    STORM_RAIN: 'icon-STORM_RAIN', //暴雨
    FOG: 'icon-FOG', //	雾
    LIGHT_SNOW: 'icon-LIGHT_SNOW', //小雪
    MODERATE_SNOW: 'icon-MODERATE_SNOW', //中雪
    HEAVY_SNOW: 'icon-HEAVY_SNOW', //大雪
    STORM_SNOW: 'icon-STORM_SNOW', //暴雪
    DUST: 'icon-DUST', //浮尘	aqi > 150，pm10 > 150，湿度 < 30%，风速 < 6 m/s
    SAND: 'icon-SAND', //沙尘	aqi > 150，pm10 > 150，湿度 < 30%，风速 > 6 m/s
    WIND: 'icon-WIND' //大风
}
const pageData = {
    data: {
        location: {
            latitude: '',
            longitude: ''
        },
        locationName: '',
        weatherBg: '',
        humidity: '-',
        pm25: '-',
        weatherIcon: '',
        temperature: '-',
        todayForeCast: '',
        week: [],
        isprecipitationShow: true,
        precipitationImage: '',
        ec: {
            lazyLoad: true
        },
        isLoaded: false,
        isDisposed: false,
        audiosrc: '',
        audioImg: '',
        audioStatus: 0
    },
    onLoad(func) {
        wx.getLocation({
            success: res => {
                console.log(res)
                const latitude = res.latitude
                const longitude = res.longitude
                this.setData({
                    location: {
                        latitude,
                        longitude
                    }
                })
                this.getLocationName()
                this.getWeather()
                this.getForeCast()
                this.getplaylist()
                func && typeof func === 'function' && func()
            },
            fail() {
                wx.showToast({
                    title: '暂时无法获取您的位置',
                    duration: 2000,
                    mask: true
                })
            }
        })
    },
    reLocation() {
        const self = this
        wx.chooseLocation({
            success(res) {
                const { name, latitude, longitude } = res
                self.setData({
                    location: {
                        latitude,
                        longitude
                    },
                    locationName: name
                })
                if (!name) {
                    self.getLocationName()
                }
                self.getWeather()
                self.getForeCast()
            }
        })
    },
    getLocationName() {
        const self = this
        const { longitude, latitude } = self.data.location || {}
        wx.request({
            url: `https://api.map.baidu.com/geocoder/v2/?ak=CdYDr23g34taKZTm0HN2bnIKLRa9swve&location=${latitude},${longitude}&pois=1&output=json`,
            data: {},
            success(res) {
                const addressComponent =
                    (res.data &&
                        res.data.result &&
                        res.data.result.addressComponent) ||
                    {}
                self.setData({
                    locationName:
                        addressComponent.district +
                        addressComponent.street +
                        addressComponent.street_number
                })
            }
        })
    },
    getWeather() {
        const self = this
        const { longitude, latitude } = self.data.location || {}
        wx.request({
            url: `https://api.caiyunapp.com/v2.4/q2aRqYc6gf196Zcf/${longitude},${latitude}/realtime.json`,
            data: {},
            success(res) {
                if (res.statusCode === 200) {
                    const result = (res.data && res.data.result) || {}

                    self.setData({
                        humidity:
                            parseInt(result.realtime.humidity * 100) || '-',
                        pm25: parseInt(result.realtime.pm25),
                        skycon: result.realtime.skycon || '-',
                        temperature:
                            parseInt(result.realtime.temperature) + '℃',
                        weatherIcon: weatherIcon[result.realtime.skycon]
                    })
                }
            },
            fail() {
                console.log('caiyunapp fail')
            }
        })
    },
    getForeCast() {
        const { longitude, latitude } = this.data.location || {}
        const ecComponent = this.selectComponent('#precipitation-canvas')
        wx.request({
            url: `https://api.caiyunapp.com/v2.4/q2aRqYc6gf196Zcf/${longitude},${latitude}/hourly.json`,
            data: {},
            success: res => {
                const result = res.data.result
                this.setData({
                    foreCast: result.hourly.description,
                    todayForeCast: result.forecast_keypoint
                })
                ecComponent.init((canvas, width, height) => {
                    this.chart = initChart(canvas, width, height, result)
                    this.setData({
                        isLoaded: true,
                        isDisposed: false
                    })
                })
            }
        })
    },
    getplaylist() {
        wx.request({
            url:
                'https://musicapi.leanapp.cn/search?keywords=%E9%98%B4%E5%A4%A9&type=1000',
            success: res => {
                const result = res.data.result
                const alumbList =
                    result.playlists[
                        Math.floor(Math.random() * result.playlists.length)
                    ]
                wx.request({
                    url:
                        'https://musicapi.leanapp.cn/playlist/detail?id=' +
                        alumbList.id,
                    success: musicListRes => {
                        this.getMusic(musicListRes)
                    }
                })
            },
            fail: err => {
                console.log('err', err)
            }
        })
        // const WxRunecComponent = this.selectComponent('#wxrun-canvas')
        // WxRunecComponent.init((canvas, width, height) => {
        //     this.chart = initChart(canvas, width, height, result)
        // })
    },
    getMusic(musicListRes) {
        const musicList = musicListRes.data.playlist
        const randomNum = Math.floor(Math.random() * musicList.trackCount)
        const musicid = musicList.trackIds[randomNum].id

        const md = {
            id: musicid,
            pic: musicList.tracks[randomNum].al.picUrl.replace(/http:\/\//,'https://'),
            name: musicList.tracks[randomNum].al.name
        }
        this.setData({
            audioImg: md.pic
        })
        console.log(md)
        wx.request({
            url: 'https://musicapi.leanapp.cn/music/url?id=' + md.id,
            success: detail => {
                if (detail.data.data[0].url) {
                    this.setData({
                        audiosrc: detail.data.data[0].url
                    })
                    this.audioCtx = wx.createAudioContext('myAudio')
                    this.audioCtx.setSrc(detail.data.data[0].url)
                    this.audioCtx.play()
                    this.setData({
                        audioStatus: 1
                    })
                } else {
                    this.getMusic(musicListRes)
                }
            }
        })
    },
    audioControl() {
        if (this.data.audioStatus) {
            this.setData({
                audioStatus: 0
            })
            this.audioPause()
        } else {
            this.setData({
                audioStatus: 1
            })
            this.audioPlay()
        }
    },
    audioPlay() {
        console.log(1)
        this.audioCtx.play()
    },
    audioPause() {
        this.audioCtx.pause()
    },
    touchMove() {},
    onPullDownRefresh() {
        this.onLoad(wx.stopPullDownRefresh)
    }
}
Page(pageData)

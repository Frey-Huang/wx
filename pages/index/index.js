//index.js
//获取应用实例

import initChart from './tempChart'
import { reqGetRealTemp, reqGetDaily, reqLocationName } from '../../api/index'
import { weatherIcon, weatherText } from '../../modules/weatherIcon'
const app = getApp()
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
    temperature: '-',
    todayForeCast: '',
    skycon: '',
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
    audioStatus: 0,
    daily: [],
    dailyskycon: [],
    dailyhumidity: []
  },
  onLoad(func) {
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      success: res => {
        console.log(res, 'location')
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
    const { longitude, latitude } = this.data.location || {}
    reqLocationName(latitude, longitude).then(res => {
      const addressComponent =
        (res.data && res.data.result && res.data.result.addressComponent) || {}
      this.setData({
        locationName:
          addressComponent.district +
          addressComponent.street +
          addressComponent.street_number
      })
    })
  },
  getWeather() {
    const { latitude, longitude } = this.data.location || {}
    reqGetRealTemp(latitude, longitude).then(res => {
      const result = (res.data && res.data.result) || {}

      this.setData({
        humidity: parseInt(result.realtime.humidity * 100) + '%',
        pm25: parseInt(result.realtime.pm25),
        skycon: result.realtime.skycon || '-',
        temperature: parseInt(result.realtime.temperature) + '℃',
        weatherIcon: weatherIcon[result.realtime.skycon]
      })
    })
  },
  getForeCast() {
    const { longitude, latitude } = this.data.location || {}
    const ecComponent = this.selectComponent('#precipitation-canvas')

    reqGetDaily(latitude, longitude).then(res => {
      const result = res.data.result
      const daily = result.daily
      console.log(daily)
      const dailyText = []
      const dailyskycon = []
      const dailyhumidity = []
      daily.temperature.map(temp => {
        const timedate = new Date(temp.date).getDate()
        dailyText.push(timedate)
      })

      daily.skycon.map(item => {
        dailyskycon.push({
          icon: weatherIcon[item.value],
          text: weatherText[item.value]
        })
      })

      daily.humidity.map(item => {
        dailyhumidity.push(Math.round(item.avg*100))
      })
      this.setData({
        daily: dailyText,
        dailyskycon,
        dailyhumidity
      })

      ecComponent.init((canvas, width, height) => {
        this.chart = initChart(canvas, width, height, result)
        this.setData({
          isLoaded: true,
          isDisposed: false
        })
      })
    })
  }
}
Page(pageData)

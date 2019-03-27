//index.js
//获取应用实例

import * as echarts from '../../ec-canvas/echarts'
const app = getApp()
const weatherIcon = {
    CLEAR_DAY: 'icon-sun', //晴天
    CLEAR_NIGHT: 'icon-moon', //晴夜
    PARTLY_CLOUDY_DAY: 'icon-cloud', //多云
    PARTLY_CLOUDY_NIGHT: 'icon-cloud-night', //多云
    CLOUDY: 'icon-cloud', //阴
    RAIN: 'icon-rain', //雨
    SNOW: 'icon-snow', //雪
    WIND: 'icon-wind', //风
    FOG: 'icon-fog' //雾
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
        isDisposed: false
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
                console.log('baidu', res)
            }
        })
    },
    getWeather() {
        const self = this
        const { longitude, latitude } = self.data.location || {}
        wx.request({
            url: `https://api.caiyunapp.com/v2.3/q2aRqYc6gf196Zcf/${longitude},${latitude}/realtime.json`,
            data: {},
            success(res) {
                console.log('caiyunapp success', res)
                if (res.statusCode === 200) {
                    const result = (res.data && res.data.result) || {}
                    self.setData({
                        humidity: parseInt(result.humidity * 100) || '-',
                        pm25: parseInt(result.pm25),
                        skycon: result.skycon || '-',
                        temperature: parseInt(result.temperature)+'℃',
                        weatherIcon: weatherIcon[result.skycon]
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
            url: `https://api.caiyunapp.com/v2.3/q2aRqYc6gf196Zcf/${longitude},${latitude}/hourly.json`,
            data: {},
            success: res => {
                const timeData = []
                const temps = []
                const perc = []
                const result = res.data.result
                this.setData({
                    foreCast: result.hourly.description,
                    todayForeCast: result.forecast_keypoint
                })
                const temperature = result.hourly.temperature

                temperature.forEach(temp => {
                    const timestamp = new Date(temp.datetime).getTime()
                    timeData.push([timestamp, temp.value])
                    temps.push(temp.value)
                })

                const precipitation = result.hourly.precipitation
                precipitation.forEach(item => {
                    const timestamp = new Date(item.datetime).getTime()
                    perc.push([timestamp, item.value])
                })

                // console.log(time,temps)
                function initChart(canvas, width, height) {
                    const chart = echarts.init(canvas, null, {
                        width: width,
                        height: height
                    })
                    canvas.setChart(chart)
                    const option = {
                        title: {
                            text: '未来48小时气温变化',
                            textStyle: {
                                fontSize: 12,
                                color: '#333'
                            }
                        },

                        axisPointer: {
                            link: { xAxisIndex: 'all' },
                            label: {
                                backgroundColor: '#777'
                            }
                        },
                        textStyle: {
                            fontSize: 8
                        },
                        brush: {
                            xAxisIndex: 'all',
                            brushLink: 'all',
                            outOfBrush: {
                                colorAlpha: 0.1
                            }
                        },
                        grid: [
                            {
                                left: '6%',
                                right: '6%',
                                height: '50%'
                            }
                        ],
                        legend: {
                            data: ['最高气温', '最低气温']
                        },
                        toolbox: {
                            show: false
                        },
                        xAxis: [
                            {
                                type: 'time',
                                boundaryGap: false,
                                splitNumber: 8,

                                axisLabel: {
                                    formatter: (value, index) => {
                                        var date = new Date(value)
                                        var texts = [
                                            (date.getHours() < 10
                                                ? '0' + date.getHours()
                                                : date.getHours()) + '时',
                                            date.getDate() + '日'
                                        ]
                                        return texts.join('\n')
                                    },
                                    fontSize: 8,
                                    padding: 0
                                },
                                axisTick: {
                                    length: 2
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                name: '温度℃',
                                scale: true,
                                axisLabel: {
                                    formatter: '{value}',
                                    fontSize: 8,
                                    padding: 0
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            {
                                type: 'value',
                                name: '降雨量',
                                position: 'right',
                                axisLabel: {
                                    formatter: '{value}',
                                    fontSize: 8,
                                    padding: 0
                                },
                                axisTick: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                },
                                min: 0,
                                max: 1
                            }
                        ],

                        series: [
                            {
                                name: '气温',
                                type: 'line',
                                data: timeData,
                                markPoint: {
                                    data: [
                                        { type: 'max', name: '最大值' },
                                        { type: 'min', name: '最小值' }
                                    ],
                                    symbolSize: 30,
                                    label: {
                                        fontSize: 8,
                                        formatter: _label =>
                                            Math.round(_label.value)
                                    }
                                },
                                markLine: {
                                    data: [{ type: 'average', name: '平均值' }],
                                    label: {
                                        position: 'middle',
                                        fontSize: 8
                                        // offset: -100
                                    }
                                }
                            },
                            {
                                name: '降雨量',
                                type: 'bar',
                                // barWidth: '60%',
                                data: perc,
                                markPoint: {
                                    data: [{ type: 'max', name: '最大值' }],
                                    symbolSize: 30,
                                    label: {
                                        fontSize: 8
                                    }
                                },
                                yAxisIndex: 1
                            }
                        ],
                        color: [
                            'rgb(79,134,189)',
                            '#CCCCFF',
                            '#61a0a8',
                            '#d48265',
                            '#91c7ae',
                            '#749f83',
                            '#ca8622',
                            '#bda29a',
                            '#6e7074',
                            '#546570',
                            '#c4ccd3'
                        ]
                    }

                    chart.setOption(option)
                    return chart
                }
                ecComponent.init((canvas, width, height) => {
                    this.chart = initChart(canvas, width, height)

                    this.setData({
                        isLoaded: true,
                        isDisposed: false
                    })
                })
            }
        })
    },
    touchMove() {},


    onPullDownRefresh() {
        this.onLoad(wx.stopPullDownRefresh)
    }
}
Page(pageData)

import * as echarts from '../../ec-canvas/echarts'


const rainLabel = value => {
  let rain = {}
  switch (true) {
      case value > 0.03 && value <= 2.5:
          rain = {
              name: '小雨',
              value: 'small',
              color: '#CCCCFF'
          }
          break
      case value > 2.5 && value <= 8:
          rain = {
              name: '中雨',
              value: 'middle',
              color: '#9393d8'
          }
          break
      case value > 8 && value <= 15:
          rain = {
              name: '大雨',
              value: 'big',
              color: '#6f6fb5'
          }
          break
      case value > 15:
          rain = {
              name: '暴雨',
              value: 'large',
              color: '#545498'
          }
          break
  }
  return rain
}
export default function initChart(canvas, width, height, result) {
    const timeData = []
    const temps = []
    const perc = []
    const temperature = result.hourly.temperature

    temperature.forEach(temp => {
        const timestamp = new Date(temp.datetime).getTime()
        timeData.push([timestamp, temp.value])
        temps.push(temp.value)
    })

    const precipitation = result.hourly.precipitation
    precipitation.forEach(item => {
        const timestamp = new Date(item.datetime).getTime()
        perc.push({
            value: [timestamp, item.value],
            itemStyle: {
                color: (function(v) {
                    return rainLabel(v).color
                })(item.value)
            }
        })
    })
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    })
    canvas.setChart(chart)
    const option = {
        title: {
            text: '48-hour forecast',
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
                splitNumber: 12,
                axisLabel: {
                    formatter: (value, index) => {
                        var date = new Date(value)
                        var texts = [
                            date.getHours() + '点',
                            date.getDate() + '日'
                        ]
                        return texts.join('\n')
                    },
                    fontSize: 8,
                    padding: 0
                },
                axisTick: {
                    length: 2
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        width: 0.1,
                        color: ['#000']
                    }
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
                smooth: true,
                axisTick: {
                    show: false
                },
                splitArea: {
                    show: true
                },
                splitLine: {
                    show: false
                }
            },
            {
                type: 'value',
                name: '降雨量mm/hr',
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
                    show: true,
                    lineStyle: {
                        width: 0.1,
                        color: ['#000']
                    }
                },
                // splitArea: {
                //     show: true
                // },
                scale: true
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
                        formatter: _label => Math.round(_label.value)
                    }
                },
                smooth: true,
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
                        fontSize: 8,
                        formatter: label => {
                            return rainLabel(label.value).name
                        }
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

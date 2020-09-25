import * as echarts from '../../ec-canvas/echarts'

export default function initChart(canvas, width, height, result) {
  const timeData = []
  const tempMax = []
  const tempMin = []
  const tempAvg = []
  const temperature = result.daily.temperature

  temperature.forEach(temp => {
    const timestamp = new Date(temp.date).getTime()
    timeData.push(timestamp)
    tempMax.push(+temp.max)
    tempMin.push(+temp.min)
    tempAvg.push(+temp.avg)
  })
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  })
  canvas.setChart(chart)
  const option = {
    title: {
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
        top: '0',
        left: 0,
        right: 0,
        bottom: 0
      }
    ],
    toolbox: {
      show: false
    },
    xAxis: {
      data: timeData,
      boundaryGap: ['20%', '20%'],
      axisLabel: {
        formatter: value => {
          return new Date(+value).getDate()
        },
        fontSize: 6,
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
    },
    yAxis: {
      type: 'value',
      show:false,
      name: '温度℃',
      nameTextStyle: {
        fontSize: 8
      },
      boundaryGap: ['12%', '12%'],
      // axisLabel: {
      //   formatter: '{value}',
      //   fontSize: 6,
      //   padding: 0
      // },
      scale: true,
      axisTick: {
        show: false
      },
      splitArea: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: '最高气温',
        type: 'line',
        data: tempMax,

        stack: 1,
        smooth: true,
        label: {
          show: true
        }
      },
      {
        name: '最低气温',
        type: 'line',
        data: tempMin,
        smooth: true,
        stack: 2,
        label: {
          show: true
        }
      },
      // {
      //   name: '平均气温',
      //   type: 'line',
      //   data: tempAvg,
      //   smooth: true,
      //   stack: 3,
      //   label: {
      //     show: true
      //   }
      // }
    ],
    color: [
      '#ff7875',
      '#b37feb',
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

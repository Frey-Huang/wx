import Request from '../utils/request.js'
const api = new Request()

const caiyun_token = 'q2aRqYc6gf196Zcf'
const baidu_ak ='CdYDr23g34taKZTm0HN2bnIKLRa9swve'

export const reqGetDaily = (latitude, longitude) => {
  const url = `https://api.caiyunapp.com/v2.5/${caiyun_token}/${longitude},${latitude}/daily.json?dailysteps=15`
  console.log(url)
  return api.getRequest({
    url,
    data: {}
  })
}

export const reqGetRealTemp = (latitude, longitude) => {
  const url = `https://api.caiyunapp.com/v2.5/${caiyun_token}/${longitude},${latitude}/realtime.json`
  return api.getRequest({
    url,
    data: {}
  })
}

export const reqLocationName = (latitude, longitude) => {
  const url = `https://api.map.baidu.com/geocoder/v2/?ak=${baidu_ak}&location=${latitude},${longitude}&pois=1&output=json`
  return api.getRequest({
    url,
    data: {}
  })
}

export default {
  reqGetDaily,
  reqGetRealTemp,
  reqLocationName
}

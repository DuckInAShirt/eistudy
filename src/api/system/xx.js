import request from '@/utils/request'

// 查询聊天记录列表
export function listXx(query) {
  return request({
    url: '/system/xx/list',
    method: 'get',
    params: query
  })
}

// 查询聊天记录详细
export function getXx(xxId) {
  return request({
    url: '/system/xx/' + xxId,
    method: 'get'
  })
}

// 新增聊天记录
export function addXx(data) {
  return request({
    url: '/system/xx',
    method: 'post',
    data: data
  })
}

// 修改聊天记录
export function updateXx(data) {
  return request({
    url: '/system/xx',
    method: 'put',
    data: data
  })
}

// 删除聊天记录
export function delXx(xxId) {
  return request({
    url: '/system/xx/' + xxId,
    method: 'delete'
  })
}

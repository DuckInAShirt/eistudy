import request from '@/utils/request'

// 查询课组信息列表
export function listKz(query) {
  return request({
    url: '/system/kz/list',
    method: 'get',
    params: query
  })
}

// 查询课组信息详细
export function getKz(kzId) {
  return request({
    url: '/system/kz/' + kzId,
    method: 'get'
  })
}

// 新增课组信息
export function addKz(data) {
  return request({
    url: '/system/kz',
    method: 'post',
    data: data
  })
}

// 修改课组信息
export function updateKz(data) {
  return request({
    url: '/system/kz',
    method: 'put',
    data: data
  })
}

// 删除课组信息
export function delKz(kzId) {
  return request({
    url: '/system/kz/' + kzId,
    method: 'delete'
  })
}

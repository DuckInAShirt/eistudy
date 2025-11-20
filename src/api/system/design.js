import request from '@/utils/request'

// 查询教学设计主列表
export function listDesign(query) {
  return request({
    url: '/system/design/list',
    method: 'get',
    params: query
  })
}

// 查询教学设计主详细
export function getDesign(id) {
  return request({
    url: '/system/design/' + id,
    method: 'get'
  })
}

// 新增教学设计主
export function addDesign(data) {
  return request({
    url: '/system/design',
    method: 'post',
    data: data
  })
}

// 修改教学设计主
export function updateDesign(data) {
  return request({
    url: '/system/design',
    method: 'put',
    data: data
  })
}

// 删除教学设计主
export function delDesign(id) {
  return request({
    url: '/system/design/' + id,
    method: 'delete'
  })
}

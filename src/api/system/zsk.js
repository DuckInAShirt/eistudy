import request from '@/utils/request'

// 查询知识库信息列表
export function listZsk(query) {
  return request({
    url: '/system/zsk/list',
    method: 'get',
    params: query
  })
}

// 查询知识库信息详细
export function getZsk(zskId) {
  return request({
    url: '/system/zsk/' + zskId,
    method: 'get'
  })
}

// 新增知识库信息
export function addZsk(data) {
  return request({
    url: '/system/zsk',
    method: 'post',
    data: data
  })
}

// 修改知识库信息
export function updateZsk(data) {
  return request({
    url: '/system/zsk',
    method: 'put',
    data: data
  })
}

// 删除知识库信息
export function delZsk(zskId) {
  return request({
    url: '/system/zsk/' + zskId,
    method: 'delete'
  })
}

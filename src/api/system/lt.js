import request from '@/utils/request'

// 查询聊天记录列表
export function listLt(query) {
  return request({
    url: '/system/lt/list',
    method: 'get',
    params: query
  })
}

// 查询聊天记录详细
export function getLt(ltId) {
  return request({
    url: '/system/lt/' + ltId,
    method: 'get'
  })
}

// 新增聊天记录

export function addLt(data) {
  return request({
    url: '/system/lt',
    method: 'post',
    data: data
  })
}

// 修改聊天记录

export function updateLt(data) {
  return request({
    url: '/system/lt',
    method: 'put',
    data: data
  })
}

// 删除聊天记录

export function delLt(ltId) {
  return request({
    url: '/system/lt/' + ltId,
    method: 'delete'
  })
}

import request from '@/utils/request'

// 查询标准答案列表
export function listAnswer(query) {
  return request({
    url: '/system/answer/list',
    method: 'get',
    params: query
  })
}

// 查询标准答案详细
export function getAnswer(id) {
  return request({
    url: '/system/answer/' + id,
    method: 'get'
  })
}

// 新增标准答案
export function addAnswer(data) {
  return request({
    url: '/system/answer',
    method: 'post',
    data: data
  })
}

// 修改标准答案
export function updateAnswer(data) {
  return request({
    url: '/system/answer',
    method: 'put',
    data: data
  })
}

// 删除标准答案
export function delAnswer(id) {
  return request({
    url: '/system/answer/' + id,
    method: 'delete'
  })
}

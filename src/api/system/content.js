import request from '@/utils/request'

// 查询教学设计内容列表
export function listContent(query) {
  return request({
    url: '/system/content/list',
    method: 'get',
    params: query
  })
}

// 查询教学设计内容详细
export function getContent(id) {
  return request({
    url: '/system/content/' + id,
    method: 'get'
  })
}

// 新增教学设计内容
export function addContent(data) {
  return request({
    url: '/system/content',
    method: 'post',
    data: data
  })
}

// 修改教学设计内容
export function updateContent(data) {
  return request({
    url: '/system/content',
    method: 'put',
    data: data
  })
}

// 删除教学设计内容
export function delContent(id) {
  return request({
    url: '/system/content/' + id,
    method: 'delete'
  })
}

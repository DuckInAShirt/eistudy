import request from '@/utils/request'

// 查询试卷列表
export function listPaper(query) {
  return request({
    url: '/system/paper/list',
    method: 'get',
    params: query
  })
}

// 查询试卷详细
export function getPaper(id) {
  return request({
    url: '/system/paper/' + id,
    method: 'get'
  })
}

// 新增试卷
export function addPaper(data) {
  return request({
    url: '/system/paper',
    method: 'post',
    data: data
  })
}

// 修改试卷
export function updatePaper(data) {
  return request({
    url: '/system/paper',
    method: 'put',
    data: data
  })
}

// 删除试卷
export function delPaper(id) {
  return request({
    url: '/system/paper/' + id,
    method: 'delete'
  })
}

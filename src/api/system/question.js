import request from '@/utils/request'

// 查询试卷题目列表
export function listQuestion(query) {
  return request({
    url: '/system/question/list',
    method: 'get',
    params: query
  })
}

// 查询试卷题目详细
export function getQuestion(id) {
  return request({
    url: '/system/question/' + id,
    method: 'get'
  })
}

// 新增试卷题目
export function addQuestion(data) {
  return request({
    url: '/system/question',
    method: 'post',
    data: data
  })
}

// 修改试卷题目
export function updateQuestion(data) {
  return request({
    url: '/system/question',
    method: 'put',
    data: data
  })
}

// 删除试卷题目
export function delQuestion(id) {
  return request({
    url: '/system/question/' + id,
    method: 'delete'
  })
}

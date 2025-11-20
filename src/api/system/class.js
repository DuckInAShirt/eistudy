import request from '@/utils/request'

// 查询课程记录列表
export function listClass(query) {
  return request({
    url: '/system/class/list',
    method: 'get',
    params: query
  })
}

// 查询课程记录详细
export function getClass(classId) {
  return request({
    url: '/system/class/' + classId,
    method: 'get'
  })
}

// 新增课程记录
export function addClass(data) {
  return request({
    url: '/system/class',
    method: 'post',
    data: data
  })
}

// 修改课程记录
export function updateClass(data) {
  return request({
    url: '/system/class',
    method: 'put',
    data: data
  })
}

// 删除课程记录
export function delClass(classId) {
  return request({
    url: '/system/class/' + classId,
    method: 'delete'
  })
}

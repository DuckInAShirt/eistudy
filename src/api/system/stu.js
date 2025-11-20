import request from '@/utils/request'

// 查询课程学生中间列表
export function listStu(query) {
  return request({
    url: '/system/stu/list',
    method: 'get',
    params: query
  })
}

// 查询课程学生中间详细
export function getStu(classId) {
  return request({
    url: '/system/stu/' + classId,
    method: 'get'
  })
}

// 新增课程学生中间
export function addStu(data) {
  return request({
    url: '/system/stu',
    method: 'post',
    data: data
  })
}

// 修改课程学生中间
export function updateStu(data) {
  return request({
    url: '/system/stu',
    method: 'put',
    data: data
  })
}

// 删除课程学生中间
export function delStu(classId) {
  return request({
    url: '/system/stu/' + classId,
    method: 'delete'
  })
}

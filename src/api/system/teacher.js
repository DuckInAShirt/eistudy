// 在@/api/system/teacher.js中
import request from '@/utils/request'

// 查询教师列表
export function listTeacher(query) {
  return request({
    url: '/system/teacher/list',
    method: 'get',
    params: query
  })
}

// 查询教师列表
export function listTeacherForClass(query) {
  return request({
    url: '/system/teacher/listTeacherForClass',
    method: 'get',
    params: query
  })
}

// 查询教师详细
export function getTeacher(teacherId) {
  return request({
    url: '/system/teacher/' + teacherId,
    method: 'get'
  })
}

// 新增教师
export function addTeacher(data) {
  return request({
    url: '/system/teacher',
    method: 'post',
    data: data
  })
}

// 修改教师
export function updateTeacher(data) {
  return request({
    url: '/system/teacher',
    method: 'put',
    data: data
  })
}

// 删除教师
export function delTeacher(teacherId) {
  return request({
    url: '/system/teacher/' + teacherId,
    method: 'delete'
  })
}

// 重置教师密码
export function resetTeacherPassword(teacherId) {
  return request({
    url: '/system/teacher/resetPassword/' + teacherId,
    method: 'put'
  })
}

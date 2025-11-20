import request from '@/utils/request'

// 查询学生信息列表
export function listStudent(query) {
  return request({
    url: '/system/student/list',
    method: 'get',
    params: query
  })
}

// 查询学生信息详细
export function getStudent(studentId) {
  return request({
    url: '/system/student/' + studentId,
    method: 'get'
  })
}

// 新增学生信息
export function addStudent(data) {
  return request({
    url: '/system/student',
    method: 'post',
    data: data
  })
}

// 修改学生信息
export function updateStudent(data) {
  return request({
    url: '/system/student',
    method: 'put',
    data: data
  })
}

// 删除学生信息
export function delStudent(studentId) {
  return request({
    url: '/system/student/' + studentId,
    method: 'delete'
  })
}

// 导入学生数据
// 导入学生数据
export function importStudentData(data) {
  return request({
    url: '/system/student/importData',
    method: 'post',
    // 特别重要：设置正确的Content-Type，不要让axios自动设置
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}



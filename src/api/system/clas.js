import request from '@/utils/request'

// 查询班级列表
export function listClas(query) {
  return request({
    url: '/system/clas/list',
    method: 'get',
    params: query
  })
}

// 查询班级详细
export function getClas(clasId) {
  return request({
    url: '/system/clas/' + clasId,
    method: 'get'
  })
}

// 新增班级
export function addClas(data) {
  return request({
    url: '/system/clas',
    method: 'post',
    data: data
  })
}

// 修改班级
export function updateClas(data) {
  return request({
    url: '/system/clas',
    method: 'put',
    data: data
  })
}

// 删除班级
export function delClas(clasId) {
  return request({
    url: '/system/clas/' + clasId,
    method: 'delete'
  })
}

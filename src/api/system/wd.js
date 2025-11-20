import request from '@/utils/request'

// 查询文档记录列表
export function listWd(query) {
  return request({
    url: '/system/wd/list',
    method: 'get',
    params: query
  })
}

// 查询文档记录详细
export function getWd(wdId) {
  return request({
    url: '/system/wd/' + wdId,
    method: 'get'
  })
}

// 新增文档记录
export function addWd(data) {
  return request({
    url: '/system/wd',
    method: 'post',
    data: data
  })
}

// 修改文档记录
export function updateWd(data) {
  return request({
    url: '/system/wd',
    method: 'put',
    data: data
  })
}

// 删除文档记录
export function delWd(wdId) {
  return request({
    url: '/system/wd/' + wdId,
    method: 'delete'
  })
}

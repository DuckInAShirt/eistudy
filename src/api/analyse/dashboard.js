import request from "@/utils/request"


// 获取仪表盘统计数据
export function getStatistics(classId) {
    return request({
        url: "/analyse/dashboard/statistics",  // 改为相对路径
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}

// 获取问题类型分布
export function getQuestionTypes(classId) {
    return request({
        url: "/analyse/dashboard/questionTypes",
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}

// 获取学科分布
export function getSubjects(classId) {
    return request({
        url: "/analyse/dashboard/subjects",
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}

// 获取复杂度分布
export function getComplexityDistribution(classId) {
    return request({
        url: "/analyse/dashboard/complexity",
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}

// 获取每日提问趋势
export function getDailyTrend(classId) {
    return request({
        url: "/analyse/dashboard/dailyTrend",
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}

// 获取热门关键词
export function getHotKeywords(classId) {
    return request({
        url: "/analyse/dashboard/hotKeywords",
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}

// 获取最活跃学生
export function getActiveStudents(classId) {
    return request({
        url: "/analyse/dashboard/activeStudents",
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}

// 获取学生学习画像
export function getStudentProfile(userName) {
    return request({
        url: "/analyse/dashboard/studentProfile",
        method: "get",
        params: { userName },
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        }
    })
}

// 历史数据处理
export function processHistoryData(classId) {
    return request({
        url: "/analyse/processHistoryData",
        method: "post",
        headers: {
            'Authorization': localStorage.getItem('token') || '' // 添加认证头
        },
        data: { classId },
    })
}


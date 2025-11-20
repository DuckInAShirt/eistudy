// 建议删除或注释掉旧的 axios 库导入，除非项目其他地方还需要它
// import axios from 'axios'

/**
 * 调用 Dify AI 聊天接口 (流式版)
 *功能	对应difyAPI	访问链接	变量
电子电路基础课程问答	app-afkfBEWGtMWAEQfCRzkPva64	http://101.43.162.190:8088/v1/chat-messages	query字段放用户问题
 * @param {string} query 用户的问题
 * @param {object} callbacks 回调函数对象
 * @param {function(string): void} callbacks.onMessage 收到消息片段时的回调
 * @param {function(): void} callbacks.onDone 消息接收完成时的回调
 * @param {function(Error): void} callbacks.onError 发生错误时的回调
 * @param {string} apiKey API密钥，默认为通用密钥
 */
export async function difyChatStream(query, { onMessage, onDone, onError }, apiKey = 'app-J4y46SO9GtwtjADyLAOj9tzL') {
  const url = 'http://101.43.162.190:8088/v1/chat-messages';
  const payload = {
    inputs: {},
    query: query,
    // 关键改动：将 response_mode 设置为 'streaming'
    response_mode: 'streaming',
    user: 'user'
  };
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 使用 fetch API 发起请求
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // 如果请求失败，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取响应体的 reader，用于读取数据流
    const reader = response.body.getReader();
    // 创建一个文本解码器，用于将二进制数据流 (Uint8Array) 转换为字符串
    const decoder = new TextDecoder('utf-8');
    // 用于缓存不完整的消息行
    let residual = '';

    while (true) {
      // 读取一块数据
      const { done, value } = await reader.read();

      if (done) {
        // 数据流已结束
        console.log('Stream finished.');
        if (onDone) {
          onDone();
        }
        break;
      }

      // 将接收到的数据块解码为字符串，并与上一批次的残留数据拼接
      const chunk = residual + decoder.decode(value, { stream: true });
      // 按行分割，因为 SSE 事件是以换行符分隔的
      const lines = chunk.split('\n');
      
      // 更新残留数据为最后一行，因为它可能不完整
      residual = lines.pop() || '';

      for (const line of lines) {
        // 跳过空行或非 data 行
        if (!line.startsWith('data:')) {
          continue;
        }

        try {
          // 移除 'data: ' 前缀并解析 JSON
          const jsonStr = line.substring(6);
          // 当流结束时，Dify 会发送一个 'data: [DONE]' 标记，需要过滤掉
          if (jsonStr.trim() === '[DONE]') {
            continue;
          }
          const data = JSON.parse(jsonStr);

          // 我们只关心 'message' 事件中的 'answer' 字段
          if (data.event === 'message' && data.answer) {
            if (onMessage) {
              onMessage(data.answer);
            }
          }
        } catch (e) {
          console.error('Failed to parse JSON from line:', line, e);
        }
      }
    }
  } catch (error) {
    console.error('Streaming failed:', error);
    if (onError) {
      onError(error);
    }
  }
}

/**
 * 调用 Dify AI 聊天接口 (非流式版)
 * @param {string} query 用户的问题
 * @param {string} apiKey API密钥，默认为通用密钥
 * @returns {Promise<object>} 返回AI回复
 */
export async function difyChat(query, apiKey = 'app-J4y46SO9GtwtjADyLAOj9tzL') {
  const url = 'http://101.43.162.190:8088/v1/chat-messages';
  const payload = {
    inputs: {},
    query: query,
    response_mode: 'blocking',
    user: 'user'
  };
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      data: {
        answer: data.answer || 'AI无回复'
      }
    };
  } catch (error) {
    console.error('Dify chat failed:', error);
    throw error;
  }
}

/**
 * 智能教案 workflow API
 * @param {string} chapter 章节/知识点
 * @returns {Promise<object>} AI返回内容
 */
export async function difyWorkflowLessonPlan(chapter) {
  const url = 'http://101.43.162.190:8088/v1/workflows/run';
  const apiKey = 'app-n1JVzEVSjlnzr7PXVdzMYtdy';
  const payload = {
    inputs: { chapter },
    response_mode: 'blocking',
    user: 'lesson-user'
  };
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (e) {
    throw e;
  }
}

/**
 * 上传文件到 Dify
 * @param {File} file 要上传的文件
 * @param {string} apiKey API密钥
 * @returns {Promise<string>} 返回文件ID
 */
export async function uploadFileToDify(file, apiKey = 'app-bS8Qyzd7klGSkVvhbc2rlBs3') {
  const url = 'http://101.43.162.190:8088/v1/files/upload';
  const headers = {
    'Authorization': `Bearer ${apiKey}`
  };

  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', 'abc-123');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

/**
 * 获取试卷分析结果
 * @param {string} fileId 上传文件后获得的文件ID
 * @param {string} courseName 课程名称
 * @param {string} apiKey API密钥
 * @returns {Promise<object>} 分析结果
 */
export async function getExamAnalysis(fileId, courseName = 'circuit', apiKey = 'app-bS8Qyzd7klGSkVvhbc2rlBs3') {
  const url = 'http://101.43.162.190:8088/v1/workflows/run';
  const payload = {
    inputs: {
      courseName: courseName,
      examFile: {
        type: "document",
        transfer_method: "local_file",
        upload_file_id: fileId
      }
    },
    response_mode: 'blocking',
    user: 'abc-124'
  };
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 尝试获取分析结果文本
    let text = '';
    if (data.data && data.data.workflow_run_id && data.data.workflow_run_id.outputs) {
      text = data.data.workflow_run_id.outputs.text || '';
    } else if (data.data && data.data.outputs) {
      text = data.data.outputs.text || '';
    } else if (data.outputs) {
      text = data.outputs.text || '';
    }

    return {
      success: true,
      text: text,
      rawData: data
    };
  } catch (error) {
    console.error('Exam analysis failed:', error);
    throw error;
  }
}

/**
 * 上传简历文件到 Dify（简历优化专用）
 * @param {File} file 要上传的简历文件
 * @param {string} apiKey API密钥
 * @returns {Promise<string>} 返回文件ID
 */
export async function uploadResumeFile(file, apiKey = 'app-PMBbbHxJePSgvz2XPPytjEre') {
  const url = 'http://43.140.245.165:8993/v1/files/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', 'zxr');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Upload response:', data);
    // 尝试多种可能的文件ID字段
    const fileId = data.id || data.file_id || data.data?.id || data.data?.file_id || '';
    if (!fileId) {
      console.error('Upload response data:', data);
      throw new Error('上传失败：未返回文件ID');
    }
    return fileId;
  } catch (error) {
    console.error('Resume file upload failed:', error);
    throw error;
  }
}

/**
 * 运行简历优化 Workflow
 * @param {string} fileId 上传文件后获得的文件ID
 * @param {string} jobDescription 职位描述
 * @param {string} apiKey API密钥
 * @returns {Promise<object>} 优化结果
 */
export async function optimizeResume(fileId, jobDescription, apiKey = 'app-PMBbbHxJePSgvz2XPPytjEre') {
  const url = 'http://43.140.245.165:8993/v1/workflows/run';
  const payload = {
    inputs: {
      resume_file: {
        transfer_method: "local_file",
        upload_file_id: fileId,
        type: "document"
      },
      job_description: jobDescription
    },
    response_mode: 'blocking',
    user: 'zxr'
  };
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('Optimize request payload:', JSON.stringify(payload, null, 2));
    console.log('File ID:', fileId);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Optimize error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    
    // 尝试获取优化结果文本
    let text = '';
    if (data.data && data.data.workflow_run_id && data.data.workflow_run_id.outputs) {
      text = data.data.workflow_run_id.outputs.text || data.data.workflow_run_id.outputs.result || '';
    } else if (data.data && data.data.outputs) {
      text = data.data.outputs.text || data.data.outputs.result || '';
    } else if (data.outputs) {
      text = data.outputs.text || data.outputs.result || '';
    } else if (data.result) {
      text = data.result;
    }

    return {
      success: true,
      text: text,
      rawData: data
    };
  } catch (error) {
    console.error('Resume optimization failed:', error);
    throw error;
  }
}

 
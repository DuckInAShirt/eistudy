// 建议删除或注释掉旧的 axios 库导入，除非项目其他地方还需要它
// import axios from 'axios'

/**
 * Dify API Key 配置映射
 * 易学广场各功能的 API Key 配置
 */
export const DIFY_API_KEYS = {
  // 课程相关
  'ecircuit': 'app-afkfBEWGtMWAEQfCRzkPva64', // 电子电路基础
  'circuit': 'app-AbJMJlJW3fiph9QF2H9N2Pym', // 电路分析基础
  // 易学广场功能
  'admission': 'app-cbJeGwN1afhl3K1lQqDQFgri', // 招生咨询
  'job-info': 'app-uvu7R4cbfiSdglLtPWxUMUFS', // 招聘信息
  // 论文选题
  'paper-topic': 'app-q7rJj04Ad97VH5oOBFvvShOz',
  // 默认密钥
  'default': 'app-J4y46SO9GtwtjADyLAOj9tzL'
}

/**
 * Dify API 服务器地址配置
 */
export const DIFY_API_URLS = {
  // 默认服务器
  'default': 'http://101.43.162.190:8088',
  // 招生咨询服务器
  'admission': 'http://43.140.245.165:8993',
  // 招聘信息服务器（与招生咨询使用同一服务器）
  'job-info': 'http://43.140.245.165:8993',
  // 简历优化服务器
  'resume': 'http://43.140.245.165:8993',
  // 论文选题服务器
  'paper-topic': 'http://43.140.245.165:8993'
}

/**
 * 调用 Dify AI 聊天接口 (流式版)
 *功能	对应difyAPI	访问链接	变量
电子电路基础课程问答	app-afkfBEWGtMWAEQfCRzkPva64	http://101.43.162.190:8088/v1/chat-messages	query字段放用户问题
 * @param {string} query 用户的问题
 * @param {object} callbacks 回调函数对象
 * @param {function(string): void} callbacks.onMessage 收到消息片段时的回调
 * @param {function(): void} callbacks.onDone 消息接收完成时的回调
 * @param {function(Error): void} callbacks.onError 发生错误时的回调
 * @param {function(string): void} callbacks.onConversationId 收到 conversation_id 时的回调（可选）
 * @param {string} apiKey API密钥，默认为通用密钥
 * @param {string} baseUrl API服务器地址，默认为默认服务器
 * @param {string} conversationId 对话ID，用于保持对话上下文（可选）
 * @param {string} userId 用户ID，默认为 'abc-123'
 */
export async function difyChatStream(
  query, 
  { onMessage, onDone, onError, onConversationId }, 
  apiKey = DIFY_API_KEYS.default,
  baseUrl = DIFY_API_URLS.default,
  conversationId = '',
  userId = 'abc-123'
) {
  const url = `${baseUrl}/v1/chat-messages`;
  const payload = {
    inputs: {},
    query: query,
    response_mode: 'streaming',
    conversation_id: conversationId,
    user: userId,
    files: [] // 可选，支持文件上传
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
      let detail = '';
      try {
        detail = await response.text();
      } catch (e) {
        detail = '';
      }
      throw new Error(`HTTP error! status: ${response.status}${detail ? ', message: ' + detail : ''}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let residual = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('Stream finished.');
        if (onDone) {
          onDone();
        }
        break;
      }

      const chunk = residual + decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      residual = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data:')) {
          continue;
        }

        try {
          const jsonStr = line.substring(6);
          if (jsonStr.trim() === '[DONE]') {
            continue;
          }
          const data = JSON.parse(jsonStr);

          if (data.event === 'message' && data.answer) {
            if (onMessage) {
              onMessage(data.answer);
            }
          }

          if (data.event === 'message_end' && data.conversation_id && onConversationId) {
            onConversationId(data.conversation_id);
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
 * 论文选题工作流流式接口
 * 将用户输入放到 workflow 的 titleBAK 字段中
 */
export async function difyPaperTopicWorkflowStream(
  titleText,
  { onMessage, onDone, onError },
  apiKey = DIFY_API_KEYS['paper-topic'],
  baseUrl = DIFY_API_URLS['paper-topic'],
  userId = 'abc-123'
) {
  const url = `${baseUrl}/v1/workflows/run`;
  const payload = {
    inputs: {
      titleBAK: titleText
    },
    response_mode: 'streaming',
    user: userId
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
      let detail = '';
      try {
        detail = await response.text();
      } catch (e) {
        detail = '';
      }
      throw new Error(`HTTP error! status: ${response.status}${detail ? ', message: ' + detail : ''}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let residual = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (onDone) onDone();
        break;
      }

      const chunk = residual + decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      residual = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        try {
          const jsonStr = line.substring(6);
          if (jsonStr.trim() === '[DONE]') continue;
          const data = JSON.parse(jsonStr);

          // 工作流的 streaming 事件中，一般在 message/outputs 里带文本
          if (data.event === 'message') {
            const text =
              data.answer ||
              data.outputs?.text ||
              data.outputs?.result ||
              '';
            if (text && onMessage) {
              onMessage(text);
            }
          }
        } catch (e) {
          console.error('Failed to parse workflow JSON from line:', line, e);
        }
      }
    }
  } catch (error) {
    console.error('Workflow streaming failed:', error);
    if (onError) onError(error);
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

 
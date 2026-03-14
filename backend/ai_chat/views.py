import json
import os
import logging
import httpx
from pathlib import Path
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# 日志输出到 backend/.log/ai_chat.log
LOG_DIR = Path(__file__).resolve().parent.parent / '.log'
LOG_DIR.mkdir(exist_ok=True)
logger = logging.getLogger('ai_chat')
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    fh = logging.FileHandler(LOG_DIR / 'ai_chat.log', encoding='utf-8')
    fh.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s'))
    logger.addHandler(fh)

MINIMAX_API_KEY = os.getenv('MINIMAX_API_KEY', '')
MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'
SYSTEM_PROMPT = '你是铭心乐Go的AI助手，一个专注于羽毛球和网球运动的智能助手。你可以帮助用户了解运动知识、比赛规则、训练建议、装备推荐等。回答要简洁实用。'


@csrf_exempt
@require_POST
def ai_chat(request):
    logger.info('收到 AI 请求, body长度: %d', len(request.body))
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        logger.warning('请求体 JSON 解析失败')
        return JsonResponse({'error': '无效的请求体'}, status=400)

    messages = body.get('messages', [])
    if not messages:
        logger.warning('消息列表为空')
        return JsonResponse({'error': '消息不能为空'}, status=400)

    logger.info('消息数: %d, 最后一条: %s', len(messages), json.dumps(messages[-1], ensure_ascii=False)[:200])

    if not MINIMAX_API_KEY:
        logger.error('MINIMAX_API_KEY 未配置')
        return JsonResponse({'error': 'AI 服务未配置'}, status=503)

    # Prepend system prompt
    full_messages = [{'role': 'system', 'content': SYSTEM_PROMPT}] + messages

    def event_stream():
        try:
            logger.info('开始调用 MiniMax API, model=MiniMax-Text-01')
            with httpx.Client(timeout=60.0) as client:
                with client.stream(
                    'POST',
                    MINIMAX_API_URL,
                    headers={
                        'Authorization': f'Bearer {MINIMAX_API_KEY}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': 'MiniMax-Text-01',
                        'messages': full_messages,
                        'stream': True,
                        'max_tokens': 2048,
                    },
                ) as resp:
                    logger.info('MiniMax 响应状态码: %d', resp.status_code)
                    if resp.status_code != 200:
                        error_body = resp.read().decode()
                        logger.error('MiniMax 返回错误: %s', error_body[:500])
                        yield f'data: {json.dumps({"error": "AI 服务异常", "done": True})}\n\n'
                        return

                    chunk_count = 0
                    total_content = ''
                    for line in resp.iter_lines():
                        logger.debug('SSE原始行: %s', line[:200])
                        if not line.startswith('data: '):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == '[DONE]':
                            logger.info('收到 [DONE], 共 %d 个chunk, 总内容长度: %d', chunk_count, len(total_content))
                            yield f'data: {json.dumps({"content": "", "done": True})}\n\n'
                            return
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk.get('choices', [{}])[0].get('delta', {})
                            content = delta.get('content', '')
                            if content:
                                chunk_count += 1
                                total_content += content
                                yield f'data: {json.dumps({"content": content, "done": False})}\n\n'
                        except json.JSONDecodeError as e:
                            logger.warning('JSON解析失败: %s, 原始: %s', e, data_str[:200])
                            continue

            logger.info('流结束(无[DONE]), 共 %d 个chunk', chunk_count if 'chunk_count' in dir() else -1)
            yield f'data: {json.dumps({"content": "", "done": True})}\n\n'

        except httpx.TimeoutException:
            logger.error('MiniMax 请求超时')
            yield f'data: {json.dumps({"error": "请求超时", "done": True})}\n\n'
        except Exception as e:
            logger.error('event_stream 异常: %s', e, exc_info=True)
            yield f'data: {json.dumps({"error": str(e), "done": True})}\n\n'

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response

import json
import os
import httpx
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', '')
DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
SYSTEM_PROMPT = '你是铭心乐Go的AI助手，一个专注于羽毛球和网球运动的智能助手。你可以帮助用户了解运动知识、比赛规则、训练建议、装备推荐等。回答要简洁实用。'


@csrf_exempt
@require_POST
def ai_chat(request):
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': '无效的请求体'}, status=400)

    messages = body.get('messages', [])
    if not messages:
        return JsonResponse({'error': '消息不能为空'}, status=400)

    if not DEEPSEEK_API_KEY:
        return JsonResponse({'error': 'AI 服务未配置'}, status=503)

    # Prepend system prompt
    full_messages = [{'role': 'system', 'content': SYSTEM_PROMPT}] + messages

    def event_stream():
        try:
            with httpx.Client(timeout=60.0) as client:
                with client.stream(
                    'POST',
                    DEEPSEEK_API_URL,
                    headers={
                        'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': 'deepseek-chat',
                        'messages': full_messages,
                        'stream': True,
                        'max_tokens': 2048,
                    },
                ) as resp:
                    if resp.status_code != 200:
                        error_body = resp.read().decode()
                        yield f'data: {json.dumps({"error": "AI 服务异常", "done": True})}\n\n'
                        return

                    for line in resp.iter_lines():
                        if not line.startswith('data: '):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == '[DONE]':
                            yield f'data: {json.dumps({"content": "", "done": True})}\n\n'
                            return
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk.get('choices', [{}])[0].get('delta', {})
                            content = delta.get('content', '')
                            if content:
                                yield f'data: {json.dumps({"content": content, "done": False})}\n\n'
                        except json.JSONDecodeError:
                            continue

            # If stream ended without [DONE]
            yield f'data: {json.dumps({"content": "", "done": True})}\n\n'

        except httpx.TimeoutException:
            yield f'data: {json.dumps({"error": "请求超时", "done": True})}\n\n'
        except Exception as e:
            yield f'data: {json.dumps({"error": str(e), "done": True})}\n\n'

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response

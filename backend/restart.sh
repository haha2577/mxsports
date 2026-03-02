#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$DIR/server.pid"
LOG_FILE="$DIR/server.log"
PORT=8001

# 停止旧进程
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "停止旧进程 PID=$OLD_PID ..."
        kill "$OLD_PID"
        sleep 1
    fi
    rm -f "$PID_FILE"
fi

# 加载环境变量
set -a
source "$DIR/.env"
set +a

# 迁移数据库
echo "执行数据库迁移..."
"$DIR/.venv/bin/python" "$DIR/manage.py" migrate --noinput

# 启动服务
echo "启动服务，端口 $PORT ..."
nohup "$DIR/.venv/bin/python" "$DIR/manage.py" runserver 0.0.0.0:$PORT \
    >> "$LOG_FILE" 2>&1 &

echo $! > "$PID_FILE"
echo "服务已启动，PID=$(cat $PID_FILE)，日志：$LOG_FILE"

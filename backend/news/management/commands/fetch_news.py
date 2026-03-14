"""
抓取新浪体育羽毛球和网球新闻，存入 News 表。

用法:
    python manage.py fetch_news              # 抓取全部(羽毛球+网球)
    python manage.py fetch_news --sport badminton
    python manage.py fetch_news --sport tennis
    python manage.py fetch_news --limit 10   # 每类最多抓10条
"""

import re
import time
from datetime import datetime

import httpx
from django.core.management.base import BaseCommand
from django.utils import timezone

from news.models import News

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

# 新浪体育列表页
SOURCES = {
    'badminton': {
        'url': 'https://sports.sina.com.cn/others/',
        'sport': 'badminton',
        'category': 'international',
        # 匹配羽毛球相关文章链接
        'link_pattern': r'href="(https://sports\.sina\.com\.cn/others/badmin/[^"]+\.shtml)"[^>]*>([^<]+)<',
    },
    'tennis': {
        'url': 'https://sports.sina.com.cn/tennis/',
        'sport': 'tennis',
        'category': 'international',
        'link_pattern': r'href="(https://sports\.sina\.com\.cn/(?:tennis|t|o)/[^"]+\.shtml)"[^>]*>([^<]+)<',
    },
}


def fetch_page(url):
    """获取页面内容，返回 HTML 文本"""
    with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=15) as client:
        resp = client.get(url)
        resp.raise_for_status()
        # 新浪页面用 utf-8 或 gb2312
        for enc in ['utf-8', 'gbk', 'gb2312']:
            try:
                return resp.content.decode(enc)
            except (UnicodeDecodeError, LookupError):
                continue
        return resp.text


def extract_article_content(html):
    """从新浪文章页提取正文和图片"""
    # 提取文章正文 - 新浪文章在 class="article" 或 id="artibody" 中
    content = ''
    summary = ''
    image_url = ''

    # 尝试提取正文段落
    # 方法1: artibody
    body_match = re.search(r'id="artibody"[^>]*>(.*?)</div>', html, re.DOTALL)
    if not body_match:
        body_match = re.search(r'class="article"[^>]*>(.*?)</div>', html, re.DOTALL)
    if not body_match:
        body_match = re.search(r'class="article-body"[^>]*>(.*?)</div>', html, re.DOTALL)

    if body_match:
        body_html = body_match.group(1)
        # 提取所有 <p> 段落
        paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', body_html, re.DOTALL)
        # 清理 HTML 标签
        clean_paragraphs = []
        for p in paragraphs:
            text = re.sub(r'<[^>]+>', '', p).strip()
            if text and len(text) > 5:
                clean_paragraphs.append(text)
        content = '\n\n'.join(clean_paragraphs)
        if clean_paragraphs:
            summary = clean_paragraphs[0][:200]

    # 提取首张图片
    img_match = re.search(
        r'<img[^>]+src="(https?://[^"]+(?:\.jpg|\.jpeg|\.png|\.webp))[^"]*"',
        html, re.IGNORECASE,
    )
    if img_match:
        image_url = img_match.group(1)

    return content, summary, image_url


def parse_date_from_url(url):
    """从 URL 中解析日期，如 /2025-01-19/"""
    m = re.search(r'/(\d{4}-\d{2}-\d{2})/', url)
    if m:
        return timezone.make_aware(datetime.strptime(m.group(1), '%Y-%m-%d'))
    return timezone.now()


class Command(BaseCommand):
    help = '从新浪体育抓取羽毛球/网球新闻'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sport', type=str, choices=['badminton', 'tennis'],
            help='只抓指定运动类型',
        )
        parser.add_argument(
            '--limit', type=int, default=20,
            help='每个类别最多抓取条数 (默认20)',
        )
        parser.add_argument(
            '--dry-run', action='store_true',
            help='只打印不入库',
        )

    def handle(self, *args, **options):
        sport_filter = options.get('sport')
        limit = options['limit']
        dry_run = options['dry_run']

        sources = SOURCES
        if sport_filter:
            sources = {sport_filter: SOURCES[sport_filter]}

        total_created = 0

        for key, src in sources.items():
            self.stdout.write(f'\n--- 抓取 {key} 新闻 ({src["url"]}) ---')

            try:
                html = fetch_page(src['url'])
            except Exception as e:
                self.stderr.write(f'获取列表页失败: {e}')
                continue

            # 提取文章链接
            matches = re.findall(src['link_pattern'], html)
            if not matches:
                self.stderr.write(f'未找到文章链接，pattern: {src["link_pattern"]}')
                # 尝试宽泛匹配
                all_links = re.findall(r'href="(https://sports\.sina\.com\.cn/[^"]+\.shtml)"[^>]*>([^<]{8,})<', html)
                self.stdout.write(f'  宽泛匹配到 {len(all_links)} 个链接')
                matches = all_links[:limit]

            seen_urls = set(News.objects.values_list('source_url', flat=True))
            created = 0

            for url, title in matches[:limit]:
                title = title.strip()
                if not title or len(title) < 5:
                    continue
                if url in seen_urls:
                    self.stdout.write(f'  跳过(已存在): {title}')
                    continue

                if dry_run:
                    self.stdout.write(f'  [DRY] {title} -> {url}')
                    created += 1
                    continue

                # 抓取文章详情
                self.stdout.write(f'  抓取: {title}')
                content = ''
                summary = ''
                image_url = ''
                try:
                    article_html = fetch_page(url)
                    content, summary, image_url = extract_article_content(article_html)
                except Exception as e:
                    self.stderr.write(f'    获取文章内容失败: {e}')

                if not summary:
                    summary = title

                published_at = parse_date_from_url(url)

                News.objects.create(
                    title=title,
                    sport=src['sport'],
                    category=src['category'],
                    summary=summary,
                    content=content or summary,
                    source_url=url,
                    image_url=image_url,
                    published_at=published_at,
                    is_active=True,
                )
                created += 1
                seen_urls.add(url)

                # 礼貌间隔
                time.sleep(0.5)

            total_created += created
            self.stdout.write(self.style.SUCCESS(f'  {key}: 新增 {created} 条'))

        self.stdout.write(self.style.SUCCESS(f'\n完成! 共新增 {total_created} 条新闻'))

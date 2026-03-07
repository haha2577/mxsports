#!/usr/bin/env python3
"""Seed script - run with: .venv/bin/python3 manage.py shell < seed_data.py"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Already configured if run via manage.py shell
from django.utils import timezone
from datetime import timedelta

from venues.models import Venue
from news.models import News
from users.models import User
from matches.models import Match
from registrations.models import Registration

now = timezone.now()

# ─── Venues ───────────────────────────────────────────────
print('Seeding venues...')
venues_data = [
    # Badminton
    dict(name='深圳市体育中心羽毛球馆', sport='badminton', district='福田区', address='福田区笋岗路1001号',
         latitude=22.5485, longitude=114.0683, phone='0755-83216688', business_hours='07:00-22:00',
         price_from=60, court_count=12, floor_type='wood', has_parking=True, parking_sufficient=True,
         has_shower=True, has_locker=True, has_ac=True, is_indoor=True, rating=4.8, review_count=356,
         description='深圳市老牌体育场馆，地处福田中心区，交通便利，12片标准羽毛球场地，木地板质量上乘。'),
    dict(name='深圳湾体育中心羽毛球馆', sport='badminton', district='南山区', address='南山区滨海大道3001号',
         latitude=22.5198, longitude=113.9380, phone='0755-26998888', business_hours='08:00-22:00',
         price_from=80, court_count=16, floor_type='wood', has_parking=True, parking_sufficient=True,
         has_shower=True, has_locker=True, has_ac=True, is_indoor=True, rating=4.9, review_count=428,
         description='春茧体育中心，深圳最大的综合体育场馆之一，设施一流，16片标准场地，经常承办市级赛事。'),
    dict(name='龙岗大运中心羽毛球馆', sport='badminton', district='龙岗区', address='龙岗区龙翔大道2188号',
         latitude=22.7215, longitude=114.2461, phone='0755-28958888', business_hours='08:00-22:00',
         price_from=50, court_count=20, floor_type='wood', has_parking=True, parking_sufficient=True,
         has_shower=True, has_locker=True, has_ac=True, is_indoor=True, rating=4.7, review_count=213,
         description='2011年大运会主场馆，设施完备，20片场地空间宽敞，停车方便，适合团体活动。'),
    dict(name='南山文体中心羽毛球馆', sport='badminton', district='南山区', address='南山区南山大道2093号',
         latitude=22.5324, longitude=113.9221, phone='0755-26080808', business_hours='07:30-22:00',
         price_from=50, court_count=8, floor_type='plastic', has_parking=True, parking_sufficient=False,
         has_shower=True, has_locker=True, has_ac=True, is_indoor=True, rating=4.6, review_count=187,
         description='南山区政府文体中心，价格实惠，场地维护良好，周末比较抢手需提前预约。'),
    dict(name='宝安体育馆羽毛球场', sport='badminton', district='宝安区', address='宝安区新安街道裕安路宝安体育馆',
         latitude=22.5553, longitude=113.8838, phone='0755-27785555', business_hours='08:00-22:00',
         price_from=45, court_count=10, floor_type='plastic', has_parking=True, parking_sufficient=True,
         has_shower=False, has_locker=True, has_ac=True, is_indoor=True, rating=4.5, review_count=156,
         description='宝安老牌球馆，性价比高，10片场地，有充足停车位，适合业余球友日常约球。'),
    dict(name='光明文体中心羽毛球馆', sport='badminton', district='光明区', address='光明区光明大道88号',
         latitude=22.7597, longitude=113.9290, phone='0755-21385000', business_hours='08:00-21:30',
         price_from=40, court_count=6, floor_type='wood', has_parking=True, parking_sufficient=True,
         has_shower=True, has_locker=True, has_ac=True, is_indoor=True, rating=4.4, review_count=89,
         description='光明区新建文体中心，设施较新，价格亲民，周边居民较多，氛围好。'),
    # Tennis
    dict(name='深圳市网球中心', sport='tennis', district='福田区', address='福田区笋岗西路体育中心内',
         latitude=22.5505, longitude=114.0570, phone='0755-83219988', business_hours='07:00-22:00',
         price_from=100, court_count=10, floor_type='plastic', has_parking=True, parking_sufficient=True,
         has_shower=True, has_locker=True, has_ac=False, is_indoor=False, rating=4.8, review_count=267,
         description='深圳市专业网球训练基地，10片标准硬地球场，灯光设施完备，多次承办ITF赛事。'),
    dict(name='深圳湾体育中心网球场', sport='tennis', district='南山区', address='南山区滨海大道3001号春茧内',
         latitude=22.5195, longitude=113.9375, phone='0755-26998888', business_hours='07:00-22:00',
         price_from=120, court_count=8, floor_type='plastic', has_parking=True, parking_sufficient=True,
         has_shower=True, has_locker=True, has_ac=False, is_indoor=False, rating=4.9, review_count=198,
         description='面朝深圳湾的网球场，风景绝佳，8片标准硬地球场，场地维护一流。'),
    dict(name='香蜜体育中心网球场', sport='tennis', district='福田区', address='福田区香蜜湖路3006号',
         latitude=22.5419, longitude=114.0393, phone='0755-83068888', business_hours='07:00-22:00',
         price_from=80, court_count=12, floor_type='plastic', has_parking=True, parking_sufficient=False,
         has_shower=True, has_locker=True, has_ac=False, is_indoor=False, rating=4.7, review_count=312,
         description='深圳最受欢迎的网球场之一，12片场地，绿化环境好，周末人气旺，建议提前预约。'),
    dict(name='华侨城网球俱乐部', sport='tennis', district='南山区', address='南山区华侨城深南大道9003号',
         latitude=22.5380, longitude=113.9740, phone='0755-26935566', business_hours='08:00-21:00',
         price_from=150, court_count=6, floor_type='clay', has_parking=True, parking_sufficient=True,
         has_shower=True, has_locker=True, has_ac=False, is_indoor=False, rating=4.6, review_count=143,
         description='深圳少有的红土球场，会员制俱乐部，环境优雅，有专业教练驻场。'),
]

for vd in venues_data:
    Venue.objects.get_or_create(name=vd['name'], defaults=vd)
print(f'  Venues: {Venue.objects.count()}')

# ─── News ─────────────────────────────────────────────────
print('Seeding news...')
news_data = [
    # International
    dict(title='BWF全英公开赛即将开幕：国羽主力全员出击', sport='badminton', category='international',
         summary='2026年全英羽毛球公开赛将于3月11日在伯明翰开赛。中国队派出石宇奇、陈雨菲等主力选手参赛，力争卫冕多个项目冠军。本届赛事吸引了来自32个国家和地区的顶级选手参赛。',
         published_at=now - timedelta(hours=6)),
    dict(title='2026印度公开赛收官：中国队豪取三金', sport='badminton', category='international',
         summary='2026年印度公开赛在新德里落下帷幕，中国队表现出色，在男单、女单和混双三个项目中夺得金牌。石宇奇决赛2-0击败安赛龙，展现出强大的竞技状态。',
         published_at=now - timedelta(days=2)),
    dict(title='ATP印第安维尔斯大师赛签表出炉：辛纳头号种子', sport='tennis', category='international',
         summary='2026年ATP1000印第安维尔斯大师赛签表正式公布，意大利名将辛纳作为头号种子坐镇上半区。中国金花郑钦文将参加WTA同期赛事，首轮对阵资格赛选手。',
         published_at=now - timedelta(hours=12)),
    dict(title='WTA迈阿密公开赛：郑钦文强势晋级八强', sport='tennis', category='international',
         summary='在刚刚结束的WTA迈阿密公开赛第四轮比赛中，中国选手郑钦文以6-3/6-4直落两盘击败对手，强势晋级八强。这是她本赛季第三次打进WTA1000级别八强。',
         published_at=now - timedelta(days=1)),
    # National
    dict(title='2026全国羽毛球锦标赛深圳站报名开启', sport='badminton', category='national',
         summary='中国羽毛球协会宣布，2026年全国羽毛球锦标赛深圳站将于4月12-15日在深圳湾体育中心举行。即日起开放各省市代表队报名，预计将有超过200名运动员参赛。',
         published_at=now - timedelta(days=1)),
    dict(title='中国羽毛球公开赛4月落户广州天河', sport='badminton', category='national',
         summary='BWF世界巡回赛超级1000赛——中国公开赛确认于4月22-27日在广州天河体育中心举行。赛事总奖金提升至120万美元，预计将吸引全球顶尖选手参赛。',
         published_at=now - timedelta(days=3)),
    dict(title='2026中国网球公开赛赛程公布', sport='tennis', category='national',
         summary='中网组委会今日公布2026年赛程安排，男子赛事为ATP500级别，女子赛事为WTA1000级别。赛事将于9月28日至10月11日在北京国家网球中心举行。',
         published_at=now - timedelta(days=2)),
    dict(title='全国业余网球联赛华南赛区激战正酣', sport='tennis', category='national',
         summary='2026年全国业余网球联赛华南赛区小组赛已进入最后阶段。深圳代表队目前以5胜1负的战绩暂列小组第一，有望晋级全国总决赛。',
         published_at=now - timedelta(days=4)),
    # Local (Shenzhen)
    dict(title='深圳市第十届业余羽毛球联赛火热报名中', sport='badminton', category='local', city='深圳市',
         summary='由深圳市羽毛球协会主办的第十届业余羽毛球联赛现已开放报名。比赛设男单、女单、男双、女双和混双五个项目，分A/B/C三个组别。报名截止日期为3月20日。',
         published_at=now - timedelta(hours=18)),
    dict(title='南山区羽毛球俱乐部联赛第三轮战报', sport='badminton', category='local', city='深圳市',
         summary='南山区羽毛球俱乐部联赛第三轮比赛于上周末在南山文体中心结束。卫冕冠军深圳湾队以3-2险胜科技园队，继续保持不败。目前积分榜前四名竞争激烈。',
         published_at=now - timedelta(days=3)),
    dict(title='深圳市网球协会春季邀请赛圆满落幕', sport='tennis', category='local', city='深圳市',
         summary='为期两天的深圳市网球协会春季邀请赛在香蜜体育中心圆满落幕。来自深圳各区的32支队伍参加了比赛，福田区代表队最终夺得团体冠军。',
         published_at=now - timedelta(days=2)),
    dict(title='福田区网球爱好者周末约战活动精彩回顾', sport='tennis', category='local', city='深圳市',
         summary='福田区网球爱好者自发组织的周末约战活动已成功举办第8期。每期活动吸引20-30名球友参加，按水平分组进行友谊赛，活动氛围融洽，深受球友好评。',
         published_at=now - timedelta(days=5)),
]

for nd in news_data:
    News.objects.get_or_create(title=nd['title'], defaults=nd)
print(f'  News: {News.objects.count()}')

# ─── Test Users ───────────────────────────────────────────
print('Seeding test users...')
test_users_data = [
    dict(openid='test_zhangwei',  nickname='张伟',   level='A组（高级）', phone='13800000001'),
    dict(openid='test_lina',      nickname='李娜',   level='B组（中级）', phone='13800000002'),
    dict(openid='test_wanglei',   nickname='王磊',   level='B组（中级）', phone='13800000003'),
    dict(openid='test_chenxi',    nickname='陈曦',   level='C组（初级）', phone='13800000004'),
    dict(openid='test_liuyang',   nickname='刘洋',   level='A组（高级）', phone='13800000005'),
    dict(openid='test_zhaomin',   nickname='赵敏',   level='B组（中级）', phone='13800000006'),
    dict(openid='test_sunqiang',  nickname='孙强',   level='C组（初级）', phone='13800000007'),
    dict(openid='test_zhoujie',   nickname='周杰',   level='A组（高级）', phone='13800000008'),
    dict(openid='test_wuhua',     nickname='吴华',   level='B组（中级）', phone='13800000009'),
    dict(openid='test_xufang',    nickname='徐芳',   level='C组（初级）', phone='13800000010'),
]

test_users = []
for ud in test_users_data:
    u, _ = User.objects.get_or_create(openid=ud['openid'], defaults=ud)
    test_users.append(u)
print(f'  Users: {User.objects.count()}')

# ─── Test Matches + Registrations ─────────────────────────
print('Seeding test matches...')
organizer = User.objects.first()  # current user or first user
if not organizer:
    organizer = test_users[0]

matches_data = [
    dict(sport='badminton', name='周末羽毛球双打约战', location='深圳湾体育中心羽毛球馆',
         city='深圳市', district='南山区', address='南山区滨海大道3001号', latitude=22.5198, longitude=113.9380,
         match_type='rotation_doubles', status='open', max_players=8, fee=30,
         start_time=now + timedelta(days=2, hours=9), organizer=organizer,
         reg_users=test_users[:5]),
    dict(sport='badminton', name='羽毛球单打循环赛', location='深圳市体育中心羽毛球馆',
         city='深圳市', district='福田区', address='福田区笋岗路1001号', latitude=22.5485, longitude=114.0683,
         match_type='round_robin', status='open', max_players=6, fee=0,
         start_time=now + timedelta(days=3, hours=14), organizer=organizer,
         reg_users=test_users[:4]),
    dict(sport='badminton', name='公司内部羽毛球友谊赛', location='南山文体中心羽毛球馆',
         city='深圳市', district='南山区', address='南山区南山大道2093号', latitude=22.5324, longitude=113.9221,
         match_type='rotation_doubles', status='open', max_players=12, fee=20,
         start_time=now + timedelta(days=5, hours=19), organizer=test_users[0],
         reg_users=test_users[:8]),
    dict(sport='tennis', name='网球双打约球', location='香蜜体育中心网球场',
         city='深圳市', district='福田区', address='福田区香蜜湖路3006号', latitude=22.5419, longitude=114.0393,
         match_type='rotation_doubles', status='open', max_players=4, fee=50,
         start_time=now + timedelta(days=1, hours=8), organizer=organizer,
         reg_users=test_users[2:5]),
    dict(sport='tennis', name='网球初学者训练营', location='深圳市网球中心',
         city='深圳市', district='福田区', address='福田区笋岗西路体育中心内', latitude=22.5505, longitude=114.0570,
         match_type='round_robin', status='open', max_players=8, fee=20,
         start_time=now + timedelta(days=4, hours=10), organizer=test_users[4],
         reg_users=test_users[3:7]),
    dict(sport='badminton', name='龙岗羽毛球精英赛', location='龙岗大运中心羽毛球馆',
         city='深圳市', district='龙岗区', address='龙岗区龙翔大道2188号', latitude=22.7215, longitude=114.2461,
         match_type='knockout', status='open', max_players=8, fee=40,
         start_time=now + timedelta(days=7, hours=14), organizer=test_users[7],
         reg_users=test_users[:6]),
    dict(sport='tennis', name='精英网球单打对抗赛', location='华侨城网球俱乐部',
         city='深圳市', district='南山区', address='南山区华侨城深南大道9003号', latitude=22.5380, longitude=113.9740,
         match_type='knockout', status='open', max_players=4, fee=80,
         start_time=now + timedelta(days=6, hours=15), organizer=test_users[0],
         reg_users=[test_users[0], test_users[4], test_users[7]]),
]

for md in matches_data:
    reg_users = md.pop('reg_users', [])
    m, created = Match.objects.get_or_create(name=md['name'], defaults=md)
    if created:
        for u in reg_users:
            Registration.objects.get_or_create(match=m, user=u, defaults={'status': 'approved', 'level': u.level})
    print(f'  Match: {m.name} ({m.registrations.count()} regs)')

print('Done!')

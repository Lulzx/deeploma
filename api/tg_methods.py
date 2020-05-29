import requests as r
import pandas as pd
from datetime import datetime
import re

TOKEN_TGSTAT = '4bb1914294369f7ba8507a33904eb3e7'  # tgstat token


def cleanText(raw_text):
    cleanr = re.compile('<.*?>|(\[.*?\|)|\]')
    cleantext = re.sub(cleanr, '', raw_text)
    return cleantext


def get_reposts_tg(post_id):
    reposts = 0
    res = r.get('https://api.tgstat.ru/posts/stat',
                params={
                    'token': TOKEN_TGSTAT,
                    'postId': post_id
                })
    try:
        response = res.json()['response']
        reposts = response['forwardsCount'] + response['mentionsCount']
    except:
        print(post_id, ' failed on ', res.json()['error'], 'in get_reposts_tg()')

    return reposts


def load_from_tg(group_id, date_from, date_to):
    headers = ["group_name", "members", "post_date", "post_link", "text", "views", "reposts"]

    offset = 0
    count_ok = True
    posts_in_group = []
    while (count_ok):
        res = r.get('https://api.tgstat.ru/channels/posts',
                    params={
                        'token': TOKEN_TGSTAT,
                        'channelId': group_id,
                        'offset': offset,
                        'limit': 50,
                        'startTime': date_from,
                        'endTime': date_to,
                        'hideDeleted': 1,
                        'hideForwards': 1,
                        'extended': 1
                    })
        try:
            response = res.json()['response']
        except:
            raise Exception(group_id, res.json()['error'])

        if response['count'] == 0:  # если в выгрузке пусто, переходим к следующей группе
            count_ok = False
            continue

        # проверяем что не вылезли за размеры выгрузки
        if offset + response['count'] != response['total_count']:
            offset += response['count']
        else:
            count_ok = False
        # считаем посты и выгружаем их
        all_posts = response['items']
        members = response['channel']['participants_count']
        for post in all_posts:
            try:
                post_info = []
                post_date = datetime.fromtimestamp(post['date'])
                post_text = cleanText(post['text'])
                reposts = get_reposts_tg(post['link'])
                post_info.append(
                    (response['channel']['title'], members, post_date, post['link'], post_text, post['views'], reposts))
                posts_in_group.extend(post_info)
            except:
                print(post)

    posts_data = pd.DataFrame(posts_in_group, columns=headers)
    mean_ = int(posts_data.groupby(posts_data['post_date'].dt.to_period('d')).mean()['views'].mean())
    std_ = int(posts_data.groupby(posts_data['post_date'].dt.to_period('d')).std()['views'].mean())

    def three_sigma_anomaly(views):
        ano_cut_off = 3 * std_
        upper_cut = mean_ + ano_cut_off
        if views > upper_cut:
            return 'Да'
        else:
            return 'Нет'

    anomalies = posts_data.views.apply(three_sigma_anomaly)
    posts_data['is_anomaly'] = anomalies

    return posts_data

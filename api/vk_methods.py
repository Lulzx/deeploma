import requests as r
import pandas as pd
import time
from datetime import datetime
import re
import urllib.parse
import json

TOKEN_VK = '23acc95023acc95023acc9504023c092a1223ac23acc9507ef4dc240205bcafea27244d'  # vk service token
version = 5.101


def get_members(group_id):
    try_count = 0
    while try_count < 2:
        try:
            response = r.get('https://api.vk.com/method/groups.getById',
                             params={
                                 'v': version,
                                 'access_token': TOKEN_VK,
                                 'group_ids': group_id,
                                 'fields': 'members_count'
                             })
            return response.json()['response'][0]['members_count']
        except:
            try_count += 1
        time.sleep(0.06)


def cleanText(raw_text):
    cleanr = re.compile('<.*?>|(\[.*?\|)|\]')
    cleantext = re.sub(cleanr, '', raw_text)
    return cleantext


def load_from_vk(group_id, date_from, date_to):
    headers = ['group_name', 'members', 'post_date', 'post_link', 'text', 'views', 'likes', 'reposts', 'comments']
    posts_in_group = []
    offset = 0
    members = get_members(group_id)

    date_ok = True
    last_try = 0
    # Выгружаем посты на стенке, пока не выйдем за "левую" дату

    while date_ok or last_try <= 1:
        res = r.get('https://api.vk.com/method/wall.get',
                    params={
                        'v': version,
                        'access_token': TOKEN_VK,
                        'domain': group_id,
                        'offset': offset,
                        'count': '100',
                        'extended': '1',
                        'fields': 'name'
                    })
        try:
            response = json.loads(urllib.parse.unquote(res.text))
            response = response['response']
        except Exception as ex:
            template = "An exception of type {0} occurred. Arguments:\n{1!r}"
            message = template.format(type(ex).__name__, ex.args)
            raise Exception(group_id, message)

        if response['count'] == 0:  # если в выгрузке пусто, заканчиваем
            date_ok = False
            last_try = 2
            continue
        # считаем посты удовлетворяющие условию по датам
        all_posts = response['items']
        group_name = response['groups'][0]['name']
        if all(datetime.fromtimestamp(post['date']).date() < date_from
               for post in all_posts):
            date_ok = False
            last_try += 1
        else:
            for post in all_posts:
                post_info = []
                post_date = datetime.fromtimestamp(post['date'])
                if date_from < post_date.date() < date_to:
                    post_link = 'https://vk.com/wall' + str(post['owner_id']) + '_' + str(post['id'])
                    post_text = cleanText(post['text'])
                    post_info.append((group_name, members, post_date, post_link, post_text,
                                      post['views']['count'], post['likes']['count'], post['reposts']['count'],
                                      post['comments']['count']))
                    posts_in_group.extend(post_info)
            offset += len(all_posts)
        time.sleep(0.06)

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

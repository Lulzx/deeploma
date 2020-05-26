from flask import Blueprint, jsonify, request
from datetime import datetime
from .vk_methods import load_from_vk
from .tg_methods import load_from_tg
import pandas as pd

main = Blueprint('main', __name__)


@main.route('/statistics', methods=['GET'])
def statistics():
    try:
        social_network = request.args.get('social_network')
        sm_id = request.args.get('sm_id').split(',')
        start_date_unix = int(request.args.get('start_date'))
        end_date_unix = int(request.args.get('end_date'))
    except:
        return jsonify({'response': {'error': 'param_not_full'}})
    start_date = datetime.fromtimestamp(start_date_unix).date()
    end_date = datetime.fromtimestamp(end_date_unix).date()

    if social_network == 'vk':
        data = pd.DataFrame()
        for sm in sm_id:
            data = data.append(load_from_vk(sm, start_date, end_date))

        data.reset_index(inplace=True, drop=True)
        data.reset_index(inplace=True)
        return jsonify({'response': {'posts': data.T.to_dict()}})
    if social_network == 'tg':
        data = pd.DataFrame()
        for sm in sm_id:
            data = data.append(load_from_tg(sm, start_date_unix, end_date_unix))

        data.reset_index(inplace=True, drop=True)
        data.reset_index(inplace=True)
        return jsonify({'response': {'posts': data.T.to_dict()}})

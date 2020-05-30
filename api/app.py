from flask import jsonify, request, Flask
from datetime import datetime
from vk_methods import load_from_vk
from tg_methods import load_from_tg
import pandas as pd
from flask_cors import CORS
import nltk
from score import text2vec, sentiment
import urllib.parse

app = Flask(__name__)
CORS(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/api/statistics', methods=['GET'])
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
    errors = []
    data = pd.DataFrame()
    if social_network == 'vk':
        for sm in sm_id:
            try:
                data = data.append(load_from_vk(sm, start_date, end_date))
            except Exception as ex:
                errors.append({'group': ex.args[0], 'error': ex.args[1]})

    if social_network == 'tg':
        for sm in sm_id:
            try:
                data = data.append(load_from_tg(sm, start_date_unix, end_date_unix))
            except Exception as ex:
                errors.append({'group': ex.args[0], 'error': ex.args[1]})

    data['sentiment'] = data.text.apply(setnimet)
    data.reset_index(inplace=True, drop=True)
    data.reset_index(inplace=True)

    return jsonify({'response': {'posts': data.T.to_dict(), 'errors': errors}})


@app.route('/api/textvector', methods=['GET'])
def textvector():
    text = request.args.get('text')
    text = urllib.parse.unquote(text)
    result = text2vec(text)
    return jsonify({'response': {'vector': result}})


@app.route('/api/sentiment', methods=['GET'])
def sentiment():
    text = request.args.get('text')
    result = sentiment(text)
    return jsonify({'response': {'tone': result}})


if __name__ == '__main__':
    nltk.download('stopwords')
    app.run()

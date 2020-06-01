from flask import jsonify, request, Flask
from datetime import datetime
from vk_methods import load_from_vk, cleanText
from tg_methods import load_from_tg
import pandas as pd
import nltk
import re
import numpy as np
import gensim
from nltk.corpus import stopwords
import tensorflow as tf
from pymorphy2 import MorphAnalyzer

app = Flask(__name__)

regex = re.compile('[^а-яА-Я]')
sentiment_model = tf.compat.v1.keras.experimental.load_from_saved_model('./sentiment_model')
morph_analyzer = MorphAnalyzer()
model_tayga_func = gensim.models.KeyedVectors.load_word2vec_format('tayga-func.bin', binary=True)


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
    try:
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
    except Exception as ex:
        return jsonify({'exception': str(ex)})

    data['sentiment'] = data.text.apply(get_sentiment)

    data.reset_index(inplace=True, drop=True)
    data.reset_index(inplace=True)
    return jsonify({'error': '', 'response': {'count': data.shape[0], 'posts': data.T.to_dict(), 'errors': errors}})


@app.route('/api/textvector', methods=['GET'])
def textvector():
    try:
        data = request.get_json(force=True)
    except:
        return {'response': {'error': "failed to read body"}}

    text = cleanText(data['text'])
    result = text2vec(text)
    return jsonify({'response': {'vector': result}})


@app.route('/api/sentiment', methods=['GET'])
def sentiment():
    try:
        data = request.get_json(force=True)
    except:
        return {'response': {'error': "failed to read body"}}

    text = cleanText(data['text'])
    result = get_sentiment(text)
    return jsonify({'response': {'tone': result}})


def text2vec(text):
    try:
        stopwords_ru = stopwords.words("russian")
    except LookupError:
        nltk.download('stopwords')
        stopwords_ru = stopwords.words("russian")
    text_vector = []
    tokens = text.split()
    for token in tokens:
        word = regex.sub('', token).lower()
        if (not word) or word in stopwords_ru:
            continue
        for word_try in morph_analyzer.parse(word):
            lemm = word_try.normal_form
            POS = word_try.tag.POS
            model_word = lemm + '_' + str(POS)
            try:
                text_vector.append(model_tayga_func.vocab[model_word].index)
                break
            except KeyError:
                continue
    return text_vector


def get_sentiment(text):
    try:
        text_vector = text2vec(text)
        input_ = np.array(text_vector, dtype=np.float32)
        result = sentiment_model.predict(input_)[0][0]
        if result >= 0.6:
            result = 'Позитивный'
        elif result <= 0.4:
            result = 'Негативный'
        else:
            result = 'Нейтральный'
        return result
    except Exception as e:
        result = str(e)
        return result


if __name__ == '__main__':
    app.run()

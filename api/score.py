import gensim
import re
from nltk.corpus import stopwords
import tensorflow as tf
from pymorphy2 import MorphAnalyzer
import numpy as np

sentiment_model = tf.keras.models.load_model('/model.h5')
model_tayga_func = gensim.models.KeyedVectors.load_word2vec_format('tayga-func.bin', binary=True)
regex = re.compile('[^а-яА-Я]')
stopwords_ru = stopwords.words("russian")
morph_analyzer = MorphAnalyzer()


def text2vec(text):
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


def sentiment(text):
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

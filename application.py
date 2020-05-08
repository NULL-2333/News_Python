from flask import *
from newsapi import NewsApiClient
from newsapi.newsapi_exception import NewsAPIException
import string

application = Flask(__name__, static_url_path='')
newsApi = NewsApiClient(api_key='cedc3362537346d7b28be057fe5ba5ef')
name2id = dict()


# 3c99adf364ea4a92b7b0eb43838db21a
# 4deb314e2bb444639d86e60e90cd4dc9
# 29dd0b6584e041b8b0876357f58d6b77
# cedc3362537346d7b28be057fe5ba5ef

# CORS
# def after_request(resp):
#     resp.headers['Access-Control-Allow-Origin'] = '*'
#     return resp
#
#
# application.after_request(after_request)


@application.route('/html/<path:path>', methods=['GET'])
def send_pages(path):
    return send_from_directory('html', path)


@application.route('/top_news', methods=['GET'])
def get_top_news():
    result = dict()
    result['articles'] = []
    result['status'] = "ok"
    try:
        return_top = newsApi.get_top_headlines(language='en', page_size=100)['articles']
    except NewsAPIException as e:
        print(e.get_message())
        return jsonify(e.get_message())
    cnt = 0
    while len(result['articles']) < 5 and cnt < len(return_top):
        top = return_top[cnt]
        # author, description, title, url, urlToImage, publishedAt and source
        if top['author'] is not None and top['author'] != 'null' and top['author'] != '' \
                and top['description'] is not None and top['description'] != 'null' and top['description'] != '' \
                and top['title'] is not None and top['title'] != 'null' and top['title'] != '' \
                and top['url'] is not None and top['url'] != 'null' and top['url'] != '' \
                and top['urlToImage'] is not None and top['urlToImage'] != 'null' and top['urlToImage'] != '' \
                and top['publishedAt'] is not None and top['publishedAt'] != 'null' and top['publishedAt'] != '' \
                and top['source'] is not None and top['source'] != 'null' and top['source'] != '' \
                and top['source']['id'] is not None and top['source']['id'] != 'null' and top['source']['id'] != '' \
                and top['source']['name'] is not None and top['source']['name'] != 'null' \
                and top['source']['name'] != '':
            result['articles'].append(top)
        cnt += 1

    return jsonify(result)


@application.route('/source=<string:source>', methods=['GET'])
def get_top_news_with_source(source):
    result = dict()
    result['articles'] = []
    result['status'] = "ok"
    cnt = 0
    try:
        returned_top = newsApi.get_top_headlines(language='en', sources=source, page_size=100)['articles']
    except NewsAPIException as e:
        print(e.get_message())
        return jsonify(e.get_message())
    while len(result['articles']) < 4 and cnt < len(returned_top):
        top = returned_top[cnt]
        if top['author'] is not None and top['author'] != 'null' and top['author'] != '' \
                and top['description'] is not None and top['description'] != 'null' and top['description'] != '' \
                and top['title'] is not None and top['title'] != 'null' and top['title'] != '' \
                and top['url'] is not None and top['url'] != 'null' and top['url'] != '' \
                and top['urlToImage'] is not None and top['urlToImage'] != 'null' and top['urlToImage'] != '' \
                and top['publishedAt'] is not None and top['publishedAt'] != 'null' and top['publishedAt'] != '' \
                and top['source'] is not None and top['source'] != 'null' and top['source'] != '' \
                and top['source']['id'] is not None and top['source']['id'] != 'null' and top['source']['id'] != '' \
                and top['source']['name'] is not None and top['source']['name'] != 'null' \
                and top['source']['name'] != '':
            result['articles'].append(top)
        cnt += 1

    return jsonify(result)


@application.route('/word_freq', methods=['GET'])
def get_word_freq():
    result = dict()
    result['res'] = []
    stopwords_file = open(str(__file__).split('application.py')[0] + "/stopwords_en.txt")
    stopwords = [line.strip('\n') for line in stopwords_file.readlines()]
    punc = str.maketrans({key: None for key in string.punctuation})
    pre_res = dict()
    try:
        top = newsApi.get_top_headlines(language='en', page_size=100)['articles']
    except NewsAPIException as e:
        print(e.get_message())
        return jsonify(e.get_message())
    for i in range(30):
        words = top[i]['title'].split(' ')
        for word in words:
            word = word.lower().translate(punc)
            if word in stopwords:
                continue
            if word in string.punctuation:
                continue
            if word not in pre_res:
                pre_res[word] = 1
            else:
                pre_res[word] += 1
    ordered_res = sorted(pre_res.items(), key=lambda item: item[1], reverse=True)
    cnt = 0
    for word in ordered_res:
        cnt += 1
        result['res'].append({"word": word[0], "size": str(word[1])})
        if cnt >= 30:
            break
    print(result['res'])
    max_size = int(result['res'][0]['size'])
    min_size = int(result['res'][-1]['size'])
    delta = max_size - min_size
    true_result = dict()
    true_result['res'] = []
    for each in result['res']:
        true_result['res'].append({"word": each['word'],
                                   "size": str(30 * (int(each['size']) - min_size) / delta + 15)})
    # print(true_result)
    return jsonify(true_result)


@application.route('/category=<string:category>', methods=['GET'])
def get_source_with_category(category):
    result = []
    try:
        if category == "all":
            news = newsApi.get_sources(language='en', country='us')
        else:
            news = newsApi.get_sources(category=category, language='en', country='us')
    except NewsAPIException as e:
        print(e.get_message())
        return jsonify(e.get_message())
    news = news['sources']
    for new in news:
        name2id[new['name']] = new['id']
        result.append({'name': new['name'], 'category': new['category']})
    return jsonify(result)


@application.route('/keyword=<string:keyword>'
                   '&from_date=<string:from_date>'
                   '&to_date=<string:to_date>'
                   '&category=<string:category>'
                   '&source=<string:source>', methods=['GET'])
def search(keyword, from_date, to_date, category, source):
    print(keyword, from_date, to_date, category, source)
    if from_date > to_date:
        return jsonify('Date Wrong!')
    result = []
    try:
        if source == 'all':
            articles = newsApi.get_everything(q=keyword, from_param=from_date,
                                              to=to_date, language='en', sort_by='publishedAt', page_size=100)
        else:
            articles = newsApi.get_everything(q=keyword, sources=name2id[source], from_param=from_date,
                                              to=to_date, language='en', sort_by='publishedAt', page_size=100)
    except NewsAPIException as e:
        print(e.get_message())
        return jsonify(e.get_message())
    if len(articles['articles']) == 0:
        return jsonify(result)
    cnt = 0
    while len(result) < 15 and cnt < len(articles['articles']):
        single_article = articles['articles'][cnt]
        if single_article['author'] is not None and single_article['author'] != 'null' \
                and single_article['author'] != '' and single_article['description'] is not None \
                and single_article['description'] != 'null' and single_article['description'] != '' \
                and single_article['title'] is not None and single_article['title'] != 'null' \
                and single_article['title'] != '' and single_article['url'] is not None \
                and single_article['url'] != 'null' and single_article['url'] != '' \
                and single_article['urlToImage'] is not None and single_article['urlToImage'] != 'null' \
                and single_article['urlToImage'] != '' and single_article['publishedAt'] is not None \
                and single_article['publishedAt'] != 'null' and single_article['publishedAt'] != '' \
                and single_article['source'] is not None and single_article['source'] != 'null' \
                and single_article['source'] != '' \
                and single_article['source']['name'] is not None and single_article['source']['name'] != 'null' \
                and single_article['source']['name'] != '':
            to_append = dict()
            to_append['author'] = single_article['author']
            to_append['description'] = single_article['description']
            to_append['title'] = single_article['title']
            to_append['url'] = single_article['url']
            to_append['urlToImage'] = single_article['urlToImage']
            date = single_article['publishedAt']
            to_append['publishedAt'] = date[5:7] + "/" + date[8:10] + "/" + date[0:4]
            to_append['id'] = single_article['source']['id']
            to_append['name'] = single_article['source']['name']
            result.append(to_append)
        cnt += 1
    print(result)
    return jsonify(result)


if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()

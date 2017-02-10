import os
import json
import requests

class WatsonVisualRecognition:

  end_point = "https://gateway-a.watsonplatform.net/visual-recognition/api"
  latest_version = '2016-05-20'
  
  def __init__(self, api_key, end_point=end_point, version=latest_version):
    self.api_key = api_key
    self.end_point = end_point
    self.version = version

  def list_classifiers(self, api_key):
    url = '/v3/classifiers'
    params = {'api_key': api_key, 'version': self.version}

    response = requests.get(self.end_point + url, 
                        params=params)

    if response.ok:
      return response.json()['classifiers']
    return []

  def get_classifier(self, api_key, classifier_id):
    url = '/v3/classifiers' + '/' + classifier_id
    params = {'api_key': api_key, 'version': self.version}

    return requests.get(self.end_point + url,
                        params=params).json()

  def create_classifier(self, api_key, classifier_name, class_files):
    '''
    classifier_name: a string that's the name of the classifier
    class_files: dictionary of {file_name: file}
    '''
    url = '/v3/classifiers'
    params = {'api_key': api_key, 'version': self.version}

    files = {
      'name': (None, classifier_name)
    }

    for class_name, file in class_files.items():
      files[class_name] = (class_name + ".zip",
                           file,
                           'application/zip')

    return requests.post(self.end_point + url,
                         files=files,
                         params=params,
                        ).json()

  def classify_image(self, api_key, classifier_ids, image_file=None, image_url="", threshold=0):
    url = '/v3/classify'
    params = {'api_key': api_key, 'version': self.version}

    if isinstance(classifier_ids, str) or isinstance(classifier_ids, unicode):
      classifier_ids = [classifier_ids]
    else:
      if not isinstance(classifier_ids, list):
        raise TypeError("classifier_ids needs to be either string or list.")

    parameters = {
      'classifier_ids': classifier_ids,
      'threshold': threshold,
      'url': image_url
    }

    files = {
      'parameters': (None, json.dumps(parameters)),
    }

    if image_file:
      files['images_file'] = (None, image_file, 'image/jpg')

    return requests.post(self.end_point + url,
                         files=files,
                         params=params).json()

  def delete_classifier(self, api_key, classifier_id):
    url = '/v3/classifiers/' + classifier_id
    params = {'api_key': api_key, 'version': self.version}
    response = requests.delete(self.end_point + url,
                           params=params).json()
    return requests.delete(self.end_point + url,
                           params=params).json()


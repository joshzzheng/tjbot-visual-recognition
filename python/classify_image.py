import os
from os.path import join, dirname
from dotenv import load_dotenv, find_dotenv
from watson_developer_cloud import VisualRecognitionV3
from pprint import pprint

def main():
  load_dotenv(find_dotenv())
  api_key=os.environ.get("API_KEY")
  classifier_id=os.environ.get("CLASSIFIER_ID")

  sdk_vr = VisualRecognitionV3('2016-05-20', api_key=api_key)

  with open(join(dirname(__file__), 
                 '../data/testing/elmo.jpg'), 'rb') as elmo:

    response = sdk_vr.classify(elmo,
                        classifier_ids=[classifier_id],
                        threshold=0.1)

    pprint(response)

if __name__ == "__main__":
    main()
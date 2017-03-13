import os
from os.path import join, dirname
from dotenv import load_dotenv, find_dotenv
from watson_developer_cloud import VisualRecognitionV3
from pprint import pprint

def main():
  load_dotenv(find_dotenv())
  api_key=os.environ.get("API_KEY")

  sdk_vr = VisualRecognitionV3('2016-05-20', api_key=api_key)

  with open(join(dirname(__file__), 
                 '../data/train/elmo.zip'), 'rb') as elmo,\
       open(join(dirname(__file__), 
                 '../data/train/big_bird.zip'), 'rb') as big_bird,\
       open(join(dirname(__file__), 
                 '../data/train/oscar.zip'), 'rb') as oscar,\
       open(join(dirname(__file__), 
                 '../data/train/cookie_monster.zip'), 'rb') as cookie_monster:

    response = sdk_vr.create_classifier("sesame_street", 
                        elmo_positive_examples=elmo,
                        big_bird_positive_examples=big_bird,
                        oscar_positive_examples=oscar,
                        cookie_monster_positive_examples=cookie_monster);

    pprint(response)

if __name__ == "__main__":
    main()
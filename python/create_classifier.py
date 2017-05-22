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
                 '../data/train/dracula.zip'), 'rb') as dracula,\
       open(join(dirname(__file__), 
                 '../data/train/frankenstein.zip'), 'rb') as frankenstein,\
       open(join(dirname(__file__), 
                 '../data/train/wolfman.zip'), 'rb') as wolfman,\
       open(join(dirname(__file__), 
                 '../data/train/mummy.zip'), 'rb') as mummy:

    response = sdk_vr.create_classifier("monsters", 
                        dracula_positive_examples=dracula,
                        frankenstein_positive_examples=frankenstein,
                        wolfman_positive_examples=wolfman,
                        mummy_positive_examples=mummy);

    pprint(response)

if __name__ == "__main__":
    main()
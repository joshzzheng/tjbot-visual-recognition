import os
from os.path import join, dirname
from dotenv import load_dotenv, find_dotenv
from pprint import pprint
from watson_visual_recognition import WatsonVisualRecognition

def main():
  load_dotenv(find_dotenv())
  api_key=os.environ.get("API_KEY")

  my_vr = WatsonVisualRecognition(api_key)

  with open(join(dirname(__file__), 
                 '../data/training/elmo.zip'), 'rb') as elmo,\
       open(join(dirname(__file__), 
                 '../data/training/big_bird.zip'), 'rb') as big_bird,\
       open(join(dirname(__file__), 
                 '../data/training/kermit.zip'), 'rb') as kermit,\
       open(join(dirname(__file__), 
                  '../data/training/cookie_monster.zip'), 'rb') as cookie_monster:
       
    class_files = {
      'elmo_positive_examples': elmo,
      'big_bird_positive_examples': big_bird,
      'kermit_positive_examples': kermit,
      'cookie_monster_positive_examples': cookie_monster
    }

    response = my_vr.create_classifier(api_key, "sesame_street", class_files)

    pprint(response)

if __name__ == "__main__":
    main()
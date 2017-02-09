import os
from dotenv import load_dotenv, find_dotenv
from pprint import pprint
from watson_developer_cloud import VisualRecognitionV3
import json
import requests

def main():
  #load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
  load_dotenv(find_dotenv())
  api_key=os.environ.get("API_KEY")

  sdk_vr = VisualRecognitionV3('2016-05-20', api_key=api_key)
  my_vr = WatsonVisualRecognition(api_key)
  
if __name__ == "__main__":
    main()
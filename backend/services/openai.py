from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

OPENAI_KEY=os.getenv("OPENAI_API_KEY")
openai_client=OpenAI(api_key=OPENAI_KEY)



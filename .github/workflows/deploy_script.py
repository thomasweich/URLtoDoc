import requests
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os

extension_id = os.environ.get('EXTENSION_ID')

# Set up OAuth 2.0 flow
flow = Flow.from_client_secrets_file(
    'oauth_client_file.json',
    scopes=['https://www.googleapis.com/auth/chromewebstore']
)

# Run the flow
creds = flow.run_local_server(port=0)

# Build the service
service = build('chromewebstore', 'v1.1', credentials=creds)

# Upload the ZIP file
with open('extension.zip', 'rb') as file:
    media_body = file.read()

response = service.items().update(
    itemId=extension_id,
    body=media_body,
    media_body=media_body
).execute()

print(response)

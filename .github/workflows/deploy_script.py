import requests
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os

extension_id = os.environ.get('EXTENSION_ID')
version = os.environ.get('VERSION', '1.0.0')

# Set up OAuth 2.0 flow
flow = Flow.from_client_secrets_file(
    'oauth_client_file.json',
    scopes=['https://www.googleapis.com/auth/chromewebstore'],
    redirect_uri='urn:ietf:wg:oauth:2.0:oob')

# Generate the authorization URL
auth_url, _ = flow.authorization_url(prompt='consent')

print(f"Please visit this URL to authorize the application: {auth_url}")
code = input("Enter the authorization code: ")

# Exchange the authorization code for credentials
flow.fetch_token(code=code)
credentials = flow.credentials

# Save the credentials for future use
with open('token.json', 'w') as token:
    token.write(credentials.to_json())

# Build the service
service = build('chromewebstore', 'v1.1', credentials=credentials)
# Upload the ZIP file
with open('extension.zip', 'rb') as file:
    media_body = file.read()

response = service.items().update(
    itemId=extension_id,
    body=media_body,
    media_body=media_body
).execute()

print(response)

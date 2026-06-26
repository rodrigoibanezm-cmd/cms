import json
import os

from google.oauth2.credentials import Credentials
from google.oauth2.service_account import Credentials as ServiceCredentials
from google.auth.transport.requests import Request

SCOPES = ["https://www.googleapis.com/auth/drive"]


def drive_credentials():
    sa_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if sa_json:
        info = json.loads(sa_json)
        return ServiceCredentials.from_service_account_info(info, scopes=SCOPES)

    refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

    if refresh_token and client_id and client_secret:
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
            scopes=SCOPES,
        )
        creds.refresh(Request())
        return creds

    raise RuntimeError(
        "Faltan credenciales: usa GOOGLE_SERVICE_ACCOUNT_JSON o "
        "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN"
    )

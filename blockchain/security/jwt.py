import jwt
import time
from datetime import datetime, timedelta
from typing import Dict, Any

class JWTManager:
    """
    Handles JSON Web Token (JWT) creation, verification, and decoding.

    This is used for authentication and authorization in the API layer.
    """
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.algorithm = "HS256"

    def create_token(self, payload: Dict[str, Any], expires_in: int = 3600) -> str:
        """
        Creates a new JWT.

        Args:
        payload: The data to encode in the token.
        expires_in: The token's expiration time in seconds.

        Returns:
        The encoded JWT.
        """
        payload_with_exp = payload.copy()
        payload_with_exp["exp"] = datetime.utcnow() + timedelta(seconds=expires_in)

        token = jwt.encode(payload_with_exp, self.secret_key, algorithm=self.algorithm)
        return token

    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verifies and decodes a JWT.

        Args:
        token: The JWT to verify.

        Returns:
        The decoded payload if valid, or an empty dictionary if invalid.
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            print("Error: Token has expired.")
        except jwt.InvalidTokenError:
            print("Error: Invalid token.")
        except Exception as e:
            print(f"Error: {e}")
        return {}

    def is_token_valid(self, token: str) -> bool:
        """
        Checks if a token is valid without returning the payload.
        """
        try:
            jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return True
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False
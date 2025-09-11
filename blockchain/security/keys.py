import os
from blockchain.security.crypto import Crypto

class KeyManager:
    """
    Handles the generation and storage of cryptographic keys.
    """
    def __init__(self, key_storage_path: str = "keys/"):
        self.key_storage_path = key_storage_path
        os.makedirs(self.key_storage_path, exist_ok=True)

    def generate_and_save_key(self, key_name: str) -> tuple:
        """
        Generates a new key pair and saves it to a file.

        Args:
        key_name: A name for the key pair (e.g., 'validator_1').

        Returns:
        The generated key pair (private_key, public_key) as hex strings.
        """
        private_key, public_key = Crypto.generate_key_pair()

        private_key_path = os.path.join(self.key_storage_path, f"{key_name}.priv")
        public_key_path = os.path.join(self.key_storage_path, f"{key_name}.pub")

        with open(private_key_path, "w") as f:
            f.write(private_key)

        with open(public_key_path, "w") as f:
            f.write(public_key)

        print(f"Key pair for '{key_name}' saved to {self.key_storage_path}.")
        return private_key, public_key

    def load_key(self, key_name: str, is_private: bool = False) -> str:
        """
        Loads a key from a file.

        Args:
        key_name: The name of the key.
        is_private: True to load the private key, False for the public key.

        Returns:
        The key as a hex string.
        """
        file_extension = ".priv" if is_private else ".pub"
        key_path = os.path.join(self.key_storage_path, f"{key_name}{file_extension}")

        try:
            with open(key_path, "r") as f:
                return f.read().strip()
        except FileNotFoundError:
            print(f"Error: Key file not found at {key_path}")
            return None
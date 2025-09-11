import hashlib
import ecdsa

class Crypto:
    """
    A simplified class for cryptographic operations.

    This module handles key generation, signing, and verification.
    It uses the `ecdsa` library for `secp256k1` signatures.
    """
    @staticmethod
    def generate_key_pair() -> tuple:
        """
        Generates a new private and public key pair.

        Returns:
        A tuple (private_key, public_key) as hex strings.
        """
        private_key = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)
        public_key = private_key.get_verifying_key()
        return (private_key.to_string().hex(), public_key.to_string().hex())

    @staticmethod
    def sign_message(private_key_hex: str, message: str) -> str:
        """
        Signs a message with a private key.

        Args:
        private_key_hex: The private key as a hex string.
        message: The message to sign.

        Returns:
        The signature as a hex string.
        """
        private_key_bytes = bytes.fromhex(private_key_hex)
        private_key = ecdsa.SigningKey.from_string(private_key_bytes, curve=ecdsa.SECP256k1)
        signature = private_key.sign(message.encode('utf-8'))
        return signature.hex()

    @staticmethod
    def verify_signature(public_key_hex: str, message: str, signature_hex: str) -> bool:
        """
        Verifies a signature against a message and a public key.

        Args:
        public_key_hex: The public key as a hex string.
        message: The message that was signed.
        signature_hex: The signature to verify.

        Returns:
        True if the signature is valid, False otherwise.
        """
        try:
            public_key_bytes = bytes.fromhex(public_key_hex)
            public_key = ecdsa.VerifyingKey.from_string(public_key_bytes, curve=ecdsa.SECP256k1)
            signature_bytes = bytes.fromhex(signature_hex)
            return public_key.verify(signature_bytes, message.encode('utf-8'))
        except ecdsa.BadSignatureError:
            return False
        except ValueError:
            return False

    @staticmethod
    def sha256_hash(data: str) -> str:
        """
        Generates a SHA-256 hash.
        """
        return hashlib.sha256(data.encode('utf-8')).hexdigest()
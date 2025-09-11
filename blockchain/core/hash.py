import hashlib
import json
from blockchain.core.types import Transaction, BlockHeader

def hash_data(data: str) -> str:
    """
    Generates a SHA-256 hash for a given string.

    Args:
    data: The input string.

    Returns:
    The hexadecimal hash.
    """
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def hash_transaction(tx: Transaction) -> str:
    """
    Generates a hash for a transaction.

    Args:
    tx: The Transaction object.

    Returns:
    The hexadecimal hash.
    """
    tx_dict = tx.__dict__.copy()
    # Signature is not included in the hash
    tx_dict.pop('signature', None)
    tx_string = json.dumps(tx_dict, sort_keys=True)
    return hash_data(tx_string)

def hash_block_header(header: BlockHeader) -> str:
    """
    Generates a hash for a block header.

    Args:
    header: The BlockHeader object.

    Returns:
    The hexadecimal hash.
    """
    header_dict = header.__dict__.copy()
    # Signature is not included in the hash
    header_dict.pop('signature', None)
    header_string = json.dumps(header_dict, sort_keys=True)
    return hash_data(header_string)
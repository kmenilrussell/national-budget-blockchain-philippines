from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class Transaction:
    """Represents a transaction on the blockchain."""
    sender: str
    recipient: str
    amount: int
    data: Optional[str] = None
    nonce: int = 0
    signature: Optional[str] = None

@dataclass
class BlockHeader:
    """Represents the header of a block."""
    prev_hash: str
    merkle_root: str
    timestamp: str
    validator: str # The public key or ID of the validator
    nonce: int = 0
    signature: Optional[str] = None

@dataclass
class Block:
    """Represents a block in the blockchain."""
    header: BlockHeader
    transactions: List[Transaction]

@dataclass
class DigitalPublicAsset:
    """
    Represents a Digital Public Asset (DPA) on the blockchain.

    This is an abstract asset class for tracking budget allocations.
    """
    asset_id: str
    owner: str # The address of the government agency
    amount: int
    data: Optional[Dict[str, Any]] = None

@dataclass
class Account:
    """Represents a wallet or account on the blockchain."""
    address: str
    balance: int = 0
    dpas: Dict[str, DigitalPublicAsset] = field(default_factory=dict)
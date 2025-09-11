from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

class HTLCStatus(Enum):
    PENDING = "pending"
    COMMITTED = "committed"
    REDEEMED = "redeemed"
    REFUNDED = "refunded"
    EXPIRED = "expired"

@dataclass
class HashedTimelockContract:
    """
    Represents a Hashed Timelock Contract (HTLC).
    
    HTLCs enable atomic swaps between parties by using:
    1. A hash lock - requires knowledge of a preimage to claim
    2. A time lock - allows refund after a timeout if not claimed
    """
    htlc_id: str
    sender: str
    receiver: str
    amount: int
    hash_lock: str  # The hash of the secret preimage
    time_lock: int  # Block height or timestamp when refund is allowed
    status: HTLCStatus = HTLCStatus.PENDING
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    redeemed_at: Optional[str] = None
    refunded_at: Optional[str] = None
    preimage: Optional[str] = None  # The secret that unlocks the contract
    metadata: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        """Validate HTLC parameters after initialization."""
        if self.amount <= 0:
            raise ValueError("HTLC amount must be positive")
        if not self.hash_lock or len(self.hash_lock) != 64:  # Assuming SHA-256 hash
            raise ValueError("Invalid hash lock")
        if self.time_lock <= 0:
            raise ValueError("Time lock must be positive")

    def is_expired(self, current_block_height: int) -> bool:
        """Check if the HTLC has expired based on block height."""
        return current_block_height >= self.time_lock

    def can_redeem(self, preimage: str, current_block_height: int) -> bool:
        """Check if the HTLC can be redeemed with the given preimage."""
        if self.status != HTLCStatus.COMMITTED:
            return False
        
        if self.is_expired(current_block_height):
            return False
        
        # Verify the preimage matches the hash lock
        import hashlib
        computed_hash = hashlib.sha256(preimage.encode()).hexdigest()
        return computed_hash == self.hash_lock

    def can_refund(self, current_block_height: int) -> bool:
        """Check if the HTLC can be refunded."""
        if self.status != HTLCStatus.COMMITTED:
            return False
        
        return self.is_expired(current_block_height)

    def redeem(self, preimage: str, current_block_height: int) -> bool:
        """Redeem the HTLC with the correct preimage."""
        if not self.can_redeem(preimage, current_block_height):
            return False
        
        self.preimage = preimage
        self.status = HTLCStatus.REDEEMED
        self.redeemed_at = datetime.now().isoformat()
        
        return True

    def refund(self, current_block_height: int) -> bool:
        """Refund the HTLC after the time lock has expired."""
        if not self.can_refund(current_block_height):
            return False
        
        self.status = HTLCStatus.REFUNDED
        self.refunded_at = datetime.now().isoformat()
        
        return True

    def to_dict(self) -> Dict[str, Any]:
        """Convert HTLC to dictionary for serialization."""
        return {
            "htlc_id": self.htlc_id,
            "sender": self.sender,
            "receiver": self.receiver,
            "amount": self.amount,
            "hash_lock": self.hash_lock,
            "time_lock": self.time_lock,
            "status": self.status.value,
            "created_at": self.created_at,
            "redeemed_at": self.redeemed_at,
            "refunded_at": self.refunded_at,
            "preimage": self.preimage,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'HashedTimelockContract':
        """Create HTLC from dictionary."""
        return cls(
            htlc_id=data["htlc_id"],
            sender=data["sender"],
            receiver=data["receiver"],
            amount=data["amount"],
            hash_lock=data["hash_lock"],
            time_lock=data["time_lock"],
            status=HTLCStatus(data["status"]),
            created_at=data["created_at"],
            redeemed_at=data.get("redeemed_at"),
            refunded_at=data.get("refunded_at"),
            preimage=data.get("preimage"),
            metadata=data.get("metadata")
        )

class HTLCManager:
    """
    Manages Hashed Timelock Contracts for atomic swaps.
    
    This class handles:
    1. Creating HTLCs for atomic swaps
    2. Committing HTLCs to the blockchain
    3. Processing redemption and refund transactions
    """
    
    def __init__(self):
        self.htlcs: Dict[str, HashedTimelockContract] = {}
        self.pending_htlcs: Dict[str, HashedTimelockContract] = {}
    
    def create_htlc(self, sender: str, receiver: str, amount: int, 
                   hash_lock: str, time_lock: int) -> HashedTimelockContract:
        """
        Create a new HTLC.
        
        Args:
            sender: The address creating the HTLC
            receiver: The address that can redeem the HTLC
            amount: The amount locked in the HTLC
            hash_lock: The hash of the secret preimage
            time_lock: The block height when refund becomes possible
            
        Returns:
            The created HTLC object
        """
        htlc_id = f"htlc_{datetime.now().timestamp()}_{sender[:8]}_{receiver[:8]}"
        
        htlc = HashedTimelockContract(
            htlc_id=htlc_id,
            sender=sender,
            receiver=receiver,
            amount=amount,
            hash_lock=hash_lock,
            time_lock=time_lock
        )
        
        self.pending_htlcs[htlc_id] = htlc
        print(f"Created HTLC {htlc_id}: {amount} from {sender} to {receiver}")
        
        return htlc
    
    def commit_htlc(self, htlc_id: str) -> bool:
        """
        Commit an HTLC to the blockchain.
        
        Args:
            htlc_id: The ID of the HTLC to commit
            
        Returns:
            True if the HTLC was committed successfully
        """
        if htlc_id not in self.pending_htlcs:
            print(f"Error: HTLC {htlc_id} not found in pending HTLCs")
            return False
        
        htlc = self.pending_htlcs[htlc_id]
        htlc.status = HTLCStatus.COMMITTED
        
        # Move from pending to active HTLCs
        self.htlcs[htlc_id] = htlc
        del self.pending_htlcs[htlc_id]
        
        print(f"Committed HTLC {htlc_id} to blockchain")
        return True
    
    def redeem_htlc(self, htlc_id: str, preimage: str, current_block_height: int) -> bool:
        """
        Redeem an HTLC with the correct preimage.
        
        Args:
            htlc_id: The ID of the HTLC to redeem
            preimage: The secret preimage
            current_block_height: The current blockchain height
            
        Returns:
            True if the HTLC was redeemed successfully
        """
        if htlc_id not in self.htlcs:
            print(f"Error: HTLC {htlc_id} not found")
            return False
        
        htlc = self.htlcs[htlc_id]
        
        if htlc.redeem(preimage, current_block_height):
            print(f"Redeemed HTLC {htlc_id} with preimage")
            return True
        
        return False
    
    def refund_htlc(self, htlc_id: str, current_block_height: int) -> bool:
        """
        Refund an HTLC after the time lock has expired.
        
        Args:
            htlc_id: The ID of the HTLC to refund
            current_block_height: The current blockchain height
            
        Returns:
            True if the HTLC was refunded successfully
        """
        if htlc_id not in self.htlcs:
            print(f"Error: HTLC {htlc_id} not found")
            return False
        
        htlc = self.htlcs[htlc_id]
        
        if htlc.refund(current_block_height):
            print(f"Refunded HTLC {htlc_id} after time lock expiry")
            return True
        
        return False
    
    def get_htlc(self, htlc_id: str) -> Optional[HashedTimelockContract]:
        """Get an HTLC by its ID."""
        return self.htlcs.get(htlc_id)
    
    def get_user_htlcs(self, user_address: str) -> Dict[str, HashedTimelockContract]:
        """Get all HTLCs involving a specific user."""
        return {
            htlc_id: htlc for htlc_id, htlc in self.htlcs.items()
            if htlc.sender == user_address or htlc.receiver == user_address
        }
    
    def generate_preimage(self) -> str:
        """Generate a random preimage for creating HTLCs."""
        import secrets
        return secrets.token_hex(32)
    
    def hash_preimage(self, preimage: str) -> str:
        """Generate a hash lock from a preimage."""
        import hashlib
        return hashlib.sha256(preimage.encode()).hexdigest()
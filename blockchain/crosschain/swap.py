from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
from blockchain.channels.htlc import HashedTimelockContract, HTLCManager

class SwapStatus(Enum):
    INITIATED = "initiated"
    LOCKED = "locked"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

@dataclass
class CrossChainSwap:
    """
    Represents an atomic swap between two different blockchains.
    
    This uses HTLCs on both chains to ensure atomicity:
    1. Party A creates HTLC on Chain 1
    2. Party B creates HTLC on Chain 2 with same hash lock
    3. Party A redeems on Chain 2, revealing the preimage
    4. Party B uses the preimage to redeem on Chain 1
    """
    swap_id: str
    initiator: str
    participant: str
    initiator_chain: str
    participant_chain: str
    initiator_amount: int
    participant_amount: int
    hash_lock: str
    time_lock: int
    status: SwapStatus = SwapStatus.INITIATED
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None
    initiator_htlc_id: Optional[str] = None
    participant_htlc_id: Optional[str] = None
    preimage: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        """Validate swap parameters after initialization."""
        if self.initiator_amount <= 0 or self.participant_amount <= 0:
            raise ValueError("Swap amounts must be positive")
        if not self.hash_lock:
            raise ValueError("Hash lock is required")
        if self.time_lock <= 0:
            raise ValueError("Time lock must be positive")

    def to_dict(self) -> Dict[str, Any]:
        """Convert swap to dictionary for serialization."""
        return {
            "swap_id": self.swap_id,
            "initiator": self.initiator,
            "participant": self.participant,
            "initiator_chain": self.initiator_chain,
            "participant_chain": self.participant_chain,
            "initiator_amount": self.initiator_amount,
            "participant_amount": self.participant_amount,
            "hash_lock": self.hash_lock,
            "time_lock": self.time_lock,
            "status": self.status.value,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
            "initiator_htlc_id": self.initiator_htlc_id,
            "participant_htlc_id": self.participant_htlc_id,
            "preimage": self.preimage,
            "metadata": self.metadata
        }

class AtomicSwapManager:
    """
    Manages atomic swaps between different blockchains.
    
    This class coordinates HTLCs across multiple chains to enable
    trustless cross-chain asset swaps.
    """
    
    def __init__(self):
        self.swaps: Dict[str, CrossChainSwap] = {}
        self.chain_htlc_managers: Dict[str, HTLCManager] = {}
    
    def register_chain(self, chain_id: str, htlc_manager: HTLCManager):
        """Register an HTLC manager for a specific blockchain."""
        self.chain_htlc_managers[chain_id] = htlc_manager
        print(f"Registered HTLC manager for chain {chain_id}")
    
    def initiate_swap(self, initiator: str, participant: str,
                     initiator_chain: str, participant_chain: str,
                     initiator_amount: int, participant_amount: int,
                     time_lock: int) -> CrossChainSwap:
        """
        Initiate a new cross-chain swap.
        
        Args:
            initiator: Address of the swap initiator
            participant: Address of the swap participant
            initiator_chain: ID of the initiator's blockchain
            participant_chain: ID of the participant's blockchain
            initiator_amount: Amount from initiator
            participant_amount: Amount from participant
            time_lock: Time lock for the HTLCs
            
        Returns:
            The created CrossChainSwap object
        """
        # Generate a new preimage and hash lock
        htlc_manager = HTLCManager()
        preimage = htlc_manager.generate_preimage()
        hash_lock = htlc_manager.hash_preimage(preimage)
        
        swap_id = f"swap_{datetime.now().timestamp()}_{initiator[:8]}_{participant[:8]}"
        
        swap = CrossChainSwap(
            swap_id=swap_id,
            initiator=initiator,
            participant=participant,
            initiator_chain=initiator_chain,
            participant_chain=participant_chain,
            initiator_amount=initiator_amount,
            participant_amount=participant_amount,
            hash_lock=hash_lock,
            time_lock=time_lock,
            preimage=preimage  # Store preimage for initiator to use later
        )
        
        self.swaps[swap_id] = swap
        print(f"Initiated cross-chain swap {swap_id}")
        
        return swap
    
    def lock_initiator_funds(self, swap_id: str) -> bool:
        """
        Lock the initiator's funds in an HTLC on their chain.
        
        Args:
            swap_id: The ID of the swap
            
        Returns:
            True if funds were locked successfully
        """
        if swap_id not in self.swaps:
            print(f"Error: Swap {swap_id} not found")
            return False
        
        swap = self.swaps[swap_id]
        
        if swap.status != SwapStatus.INITIATED:
            print(f"Error: Swap {swap_id} is in invalid state {swap.status}")
            return False
        
        # Get HTLC manager for initiator's chain
        if swap.initiator_chain not in self.chain_htlc_managers:
            print(f"Error: No HTLC manager for chain {swap.initiator_chain}")
            return False
        
        htlc_manager = self.chain_htlc_managers[swap.initiator_chain]
        
        # Create HTLC on initiator's chain
        htlc = htlc_manager.create_htlc(
            sender=swap.initiator,
            receiver=swap.participant,
            amount=swap.initiator_amount,
            hash_lock=swap.hash_lock,
            time_lock=swap.time_lock
        )
        
        # Commit the HTLC to the blockchain
        if not htlc_manager.commit_htlc(htlc.htlc_id):
            print(f"Error: Failed to commit HTLC on {swap.initiator_chain}")
            return False
        
        swap.initiator_htlc_id = htlc.htlc_id
        swap.status = SwapStatus.LOCKED
        
        print(f"Locked initiator funds for swap {swap_id} on {swap.initiator_chain}")
        return True
    
    def lock_participant_funds(self, swap_id: str) -> bool:
        """
        Lock the participant's funds in an HTLC on their chain.
        
        Args:
            swap_id: The ID of the swap
            
        Returns:
            True if funds were locked successfully
        """
        if swap_id not in self.swaps:
            print(f"Error: Swap {swap_id} not found")
            return False
        
        swap = self.swaps[swap_id]
        
        if swap.status != SwapStatus.LOCKED:
            print(f"Error: Swap {swap_id} is in invalid state {swap.status}")
            return False
        
        # Get HTLC manager for participant's chain
        if swap.participant_chain not in self.chain_htlc_managers:
            print(f"Error: No HTLC manager for chain {swap.participant_chain}")
            return False
        
        htlc_manager = self.chain_htlc_managers[swap.participant_chain]
        
        # Create HTLC on participant's chain with same hash lock
        htlc = htlc_manager.create_htlc(
            sender=swap.participant,
            receiver=swap.initiator,
            amount=swap.participant_amount,
            hash_lock=swap.hash_lock,
            time_lock=swap.time_lock
        )
        
        # Commit the HTLC to the blockchain
        if not htlc_manager.commit_htlc(htlc.htlc_id):
            print(f"Error: Failed to commit HTLC on {swap.participant_chain}")
            return False
        
        swap.participant_htlc_id = htlc.htlc_id
        
        print(f"Locked participant funds for swap {swap_id} on {swap.participant_chain}")
        return True
    
    def complete_swap(self, swap_id: str, current_block_height: int) -> bool:
        """
        Complete the swap by redeeming HTLCs on both chains.
        
        Args:
            swap_id: The ID of the swap
            current_block_height: Current blockchain height
            
        Returns:
            True if the swap was completed successfully
        """
        if swap_id not in self.swaps:
            print(f"Error: Swap {swap_id} not found")
            return False
        
        swap = self.swaps[swap_id]
        
        if not swap.participant_htlc_id:
            print(f"Error: Participant HTLC not created for swap {swap_id}")
            return False
        
        # Step 1: Redeem on participant's chain (reveals preimage)
        participant_htlc_manager = self.chain_htlc_managers[swap.participant_chain]
        
        if not participant_htlc_manager.redeem_htlc(
            swap.participant_htlc_id, swap.preimage, current_block_height
        ):
            print(f"Error: Failed to redeem on {swap.participant_chain}")
            return False
        
        # Step 2: Redeem on initiator's chain using the same preimage
        initiator_htlc_manager = self.chain_htlc_managers[swap.initiator_chain]
        
        if not initiator_htlc_manager.redeem_htlc(
            swap.initiator_htlc_id, swap.preimage, current_block_height
        ):
            print(f"Error: Failed to redeem on {swap.initiator_chain}")
            return False
        
        swap.status = SwapStatus.COMPLETED
        swap.completed_at = datetime.now().isoformat()
        
        print(f"Completed cross-chain swap {swap_id}")
        return True
    
    def refund_swap(self, swap_id: str, current_block_height: int) -> bool:
        """
        Refund the swap if it times out.
        
        Args:
            swap_id: The ID of the swap
            current_block_height: Current blockchain height
            
        Returns:
            True if the swap was refunded successfully
        """
        if swap_id not in self.swaps:
            print(f"Error: Swap {swap_id} not found")
            return False
        
        swap = self.swaps[swap_id]
        
        # Refund on both chains if HTLCs exist
        refunded = False
        
        if swap.initiator_htlc_id:
            initiator_htlc_manager = self.chain_htlc_managers[swap.initiator_chain]
            if initiator_htlc_manager.refund_htlc(swap.initiator_htlc_id, current_block_height):
                refunded = True
        
        if swap.participant_htlc_id:
            participant_htlc_manager = self.chain_htlc_managers[swap.participant_chain]
            if participant_htlc_manager.refund_htlc(swap.participant_htlc_id, current_block_height):
                refunded = True
        
        if refunded:
            swap.status = SwapStatus.REFUNDED
            swap.completed_at = datetime.now().isoformat()
            print(f"Refunded cross-chain swap {swap_id}")
            return True
        
        return False
    
    def get_swap(self, swap_id: str) -> Optional[CrossChainSwap]:
        """Get a swap by its ID."""
        return self.swaps.get(swap_id)
    
    def get_user_swaps(self, user_address: str) -> Dict[str, CrossChainSwap]:
        """Get all swaps involving a specific user."""
        return {
            swap_id: swap for swap_id, swap in self.swaps.items()
            if swap.initiator == user_address or swap.participant == user_address
        }
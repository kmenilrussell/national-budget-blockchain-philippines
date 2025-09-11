from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class ChannelState(Enum):
    OPENING = "opening"
    OPEN = "open"
    CLOSING = "closing"
    CLOSED = "closed"

@dataclass
class ChannelParticipant:
    """Represents a participant in a state channel."""
    participant_id: str
    address: str
    balance: int
    is_initiator: bool = False

@dataclass
class ChannelStateUpdate:
    """Represents a state update in a channel."""
    sequence_number: int
    balances: Dict[str, int]  # participant_id -> balance
    timestamp: str
    signatures: Dict[str, str] = field(default_factory=dict)  # participant_id -> signature

@dataclass
class StateChannel:
    """
    Represents a state channel for off-chain transactions.
    
    State channels allow participants to conduct multiple transactions
    off-chain, only settling the final state on the blockchain.
    """
    channel_id: str
    participants: List[ChannelParticipant]
    initial_balances: Dict[str, int]
    current_state: ChannelStateUpdate
    channel_state: ChannelState = ChannelState.OPENING
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    closed_at: Optional[str] = None
    dispute_timeout: int = 86400  # 24 hours in seconds
    metadata: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        """Validate channel parameters after initialization."""
        if len(self.participants) < 2:
            raise ValueError("State channel requires at least 2 participants")
        
        # Validate that all participants have initial balances
        for participant in self.participants:
            if participant.participant_id not in self.initial_balances:
                raise ValueError(f"Missing initial balance for participant {participant.participant_id}")

    def get_participant_balance(self, participant_id: str) -> int:
        """Get the current balance of a participant."""
        return self.current_state.balances.get(participant_id, 0)

    def is_valid_state_update(self, new_state: ChannelStateUpdate) -> bool:
        """Validate a new state update."""
        # Check sequence number
        if new_state.sequence_number != self.current_state.sequence_number + 1:
            return False
        
        # Check that total balance is preserved
        old_total = sum(self.current_state.balances.values())
        new_total = sum(new_state.balances.values())
        
        if old_total != new_total:
            return False
        
        # Check that all participants have balances
        for participant in self.participants:
            if participant.participant_id not in new_state.balances:
                return False
        
        return True

    def apply_state_update(self, new_state: ChannelStateUpdate) -> bool:
        """Apply a new state update to the channel."""
        if not self.is_valid_state_update(new_state):
            return False
        
        # Check for required signatures
        required_signatures = len(self.participants)
        if len(new_state.signatures) < required_signatures:
            return False
        
        # Verify all signatures (simplified - would use actual crypto in production)
        for participant_id, signature in new_state.signatures.items():
            if not signature:  # Simplified check
                return False
        
        self.current_state = new_state
        return True

    def to_dict(self) -> Dict[str, Any]:
        """Convert channel to dictionary for serialization."""
        return {
            "channel_id": self.channel_id,
            "participants": [
                {
                    "participant_id": p.participant_id,
                    "address": p.address,
                    "balance": p.balance,
                    "is_initiator": p.is_initiator
                }
                for p in self.participants
            ],
            "initial_balances": self.initial_balances,
            "current_state": {
                "sequence_number": self.current_state.sequence_number,
                "balances": self.current_state.balances,
                "timestamp": self.current_state.timestamp,
                "signatures": self.current_state.signatures
            },
            "channel_state": self.channel_state.value,
            "created_at": self.created_at,
            "closed_at": self.closed_at,
            "dispute_timeout": self.dispute_timeout,
            "metadata": self.metadata
        }

class ChannelManager:
    """
    Manages the lifecycle of state channels.
    
    This class handles:
    1. Creating new state channels
    2. Processing state updates
    3. Closing channels and settling on-chain
    """
    
    def __init__(self):
        self.channels: Dict[str, StateChannel] = {}
        self.pending_closures: Dict[str, StateChannel] = {}
    
    def create_channel(self, participants: List[ChannelParticipant], 
                      dispute_timeout: int = 86400) -> StateChannel:
        """
        Create a new state channel.
        
        Args:
            participants: List of channel participants
            dispute_timeout: Timeout for dispute resolution in seconds
            
        Returns:
            The created StateChannel object
        """
        channel_id = f"channel_{datetime.now().timestamp()}"
        
        # Set initial balances
        initial_balances = {p.participant_id: p.balance for p in participants}
        
        # Create initial state
        initial_state = ChannelStateUpdate(
            sequence_number=0,
            balances=initial_balances.copy(),
            timestamp=datetime.now().isoformat()
        )
        
        channel = StateChannel(
            channel_id=channel_id,
            participants=participants,
            initial_balances=initial_balances,
            current_state=initial_state,
            dispute_timeout=dispute_timeout
        )
        
        self.channels[channel_id] = channel
        print(f"Created state channel {channel_id} with {len(participants)} participants")
        
        return channel
    
    def update_channel_state(self, channel_id: str, new_state: ChannelStateUpdate) -> bool:
        """
        Update the state of an existing channel.
        
        Args:
            channel_id: The ID of the channel
            new_state: The new state update
            
        Returns:
            True if the update was successful
        """
        if channel_id not in self.channels:
            print(f"Error: Channel {channel_id} not found")
            return False
        
        channel = self.channels[channel_id]
        
        if channel.channel_state != ChannelState.OPEN:
            print(f"Error: Cannot update channel in state {channel.channel_state}")
            return False
        
        if channel.apply_state_update(new_state):
            print(f"Updated channel {channel_id} to state {new_state.sequence_number}")
            return True
        
        return False
    
    def initiate_channel_closure(self, channel_id: str, final_state: ChannelStateUpdate) -> bool:
        """
        Initiate the closure of a channel.
        
        Args:
            channel_id: The ID of the channel to close
            final_state: The proposed final state
            
        Returns:
            True if closure was initiated successfully
        """
        if channel_id not in self.channels:
            print(f"Error: Channel {channel_id} not found")
            return False
        
        channel = self.channels[channel_id]
        
        if channel.channel_state != ChannelState.OPEN:
            print(f"Error: Cannot close channel in state {channel.channel_state}")
            return False
        
        # Validate final state
        if not channel.is_valid_state_update(final_state):
            print("Error: Invalid final state")
            return False
        
        channel.channel_state = ChannelState.CLOSING
        channel.current_state = final_state
        self.pending_closures[channel_id] = channel
        
        print(f"Initiated closure of channel {channel_id}")
        return True
    
    def finalize_channel_closure(self, channel_id: str) -> bool:
        """
        Finalize the closure of a channel after the dispute period.
        
        Args:
            channel_id: The ID of the channel to finalize
            
        Returns:
            True if closure was finalized successfully
        """
        if channel_id not in self.pending_closures:
            print(f"Error: Channel {channel_id} not in pending closure")
            return False
        
        channel = self.pending_closures[channel_id]
        channel.channel_state = ChannelState.CLOSED
        channel.closed_at = datetime.now().isoformat()
        
        # Move from pending closures to closed channels
        del self.pending_closures[channel_id]
        self.channels[channel_id] = channel
        
        print(f"Finalized closure of channel {channel_id}")
        return True
    
    def get_channel(self, channel_id: str) -> Optional[StateChannel]:
        """Get a channel by its ID."""
        return self.channels.get(channel_id)
    
    def get_user_channels(self, user_id: str) -> List[StateChannel]:
        """Get all channels for a specific user."""
        return [
            channel for channel in self.channels.values()
            if any(p.participant_id == user_id for p in channel.participants)
        ]
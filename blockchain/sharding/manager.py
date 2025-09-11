from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Any, Tuple
from datetime import datetime
from enum import Enum
import hashlib
import threading
import time

class ShardStatus(Enum):
    ACTIVE = "active"
    SYNCING = "syncing"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

class CrossShardTransactionStatus(Enum):
    PENDING = "pending"
    COMMITTED = "committed"
    FINALIZED = "finalized"
    FAILED = "failed"

@dataclass
class Shard:
    """Represents a shard in the sharded blockchain."""
    shard_id: int
    name: str
    status: ShardStatus = ShardStatus.ACTIVE
    node_count: int = 0
    total_transactions: int = 0
    total_value: int = 0
    last_block_height: int = 0
    last_block_hash: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class CrossShardTransaction:
    """Represents a transaction that spans multiple shards."""
    tx_id: str
    source_shard_id: int
    target_shard_id: int
    sender: str
    recipient: str
    amount: int
    status: CrossShardTransactionStatus = CrossShardTransactionStatus.PENDING
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    committed_at: Optional[str] = None
    finalized_at: Optional[str] = None
    source_tx_hash: Optional[str] = None
    target_tx_hash: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ShardManager:
    """
    Manages blockchain sharding for scalability.
    
    This class handles:
    1. Creating and managing shards
    2. Routing transactions to appropriate shards
    3. Handling cross-shard transactions
    4. Load balancing and shard synchronization
    """
    
    def __init__(self, total_shards: int = 4):
        self.total_shards = total_shards
        self.shards: Dict[int, Shard] = {}
        self.cross_shard_txs: Dict[str, CrossShardTransaction] = {}
        self.pending_cross_shard_txs: Dict[str, CrossShardTransaction] = {}
        self.shard_locks: Dict[int, threading.Lock] = {}
        self.is_running = False
        self.sync_thread = None
        
        # Initialize shards
        self._initialize_shards()
    
    def _initialize_shards(self):
        """Initialize the shards."""
        for i in range(self.total_shards):
            shard = Shard(
                shard_id=i,
                name=f"Shard-{i}"
            )
            self.shards[i] = shard
            self.shard_locks[i] = threading.Lock()
        
        print(f"Initialized {self.total_shards} shards")
    
    def get_shard_for_address(self, address: str) -> int:
        """
        Determine which shard an address belongs to.
        
        Args:
            address: The address to shard
            
        Returns:
            The shard ID for the address
        """
        # Use a simple hash-based sharding strategy
        address_hash = hashlib.sha256(address.encode()).hexdigest()
        shard_id = int(address_hash[:8], 16) % self.total_shards
        return shard_id
    
    def get_shard_for_transaction(self, sender: str, recipient: str) -> Tuple[int, bool]:
        """
        Determine which shard a transaction belongs to and if it's cross-shard.
        
        Args:
            sender: The sender address
            recipient: The recipient address
            
        Returns:
            Tuple of (shard_id, is_cross_shard)
        """
        sender_shard = self.get_shard_for_address(sender)
        recipient_shard = self.get_shard_for_address(recipient)
        
        if sender_shard == recipient_shard:
            return sender_shard, False
        else:
            return sender_shard, True
    
    def add_transaction_to_shard(self, shard_id: int, tx_data: Dict[str, Any]) -> bool:
        """
        Add a transaction to a specific shard.
        
        Args:
            shard_id: The ID of the shard
            tx_data: The transaction data
            
        Returns:
            True if the transaction was added successfully
        """
        if shard_id not in self.shards:
            print(f"Error: Shard {shard_id} not found")
            return False
        
        with self.shard_locks[shard_id]:
            shard = self.shards[shard_id]
            
            if shard.status != ShardStatus.ACTIVE:
                print(f"Error: Shard {shard_id} is not active")
                return False
            
            # Update shard statistics
            shard.total_transactions += 1
            shard.total_value += tx_data.get("amount", 0)
            
            print(f"Added transaction to shard {shard_id}")
            return True
    
    def create_cross_shard_transaction(self, sender: str, recipient: str, 
                                     amount: int, metadata: Optional[Dict[str, Any]] = None) -> CrossShardTransaction:
        """
        Create a cross-shard transaction.
        
        Args:
            sender: The sender address
            recipient: The recipient address
            amount: The transaction amount
            metadata: Optional transaction metadata
            
        Returns:
            The created CrossShardTransaction object
        """
        source_shard_id = self.get_shard_for_address(sender)
        target_shard_id = self.get_shard_for_address(recipient)
        
        if source_shard_id == target_shard_id:
            print("Error: This is not a cross-shard transaction")
            return None
        
        tx_id = f"cstx_{datetime.now().timestamp()}_{sender[:8]}_{recipient[:8]}"
        
        cross_shard_tx = CrossShardTransaction(
            tx_id=tx_id,
            source_shard_id=source_shard_id,
            target_shard_id=target_shard_id,
            sender=sender,
            recipient=recipient,
            amount=amount,
            metadata=metadata
        )
        
        self.pending_cross_shard_txs[tx_id] = cross_shard_tx
        print(f"Created cross-shard transaction {tx_id} from shard {source_shard_id} to {target_shard_id}")
        
        return cross_shard_tx
    
    def commit_cross_shard_transaction(self, tx_id: str, source_tx_hash: str) -> bool:
        """
        Commit a cross-shard transaction on the source shard.
        
        Args:
            tx_id: The ID of the cross-shard transaction
            source_tx_hash: The transaction hash on the source shard
            
        Returns:
            True if the transaction was committed successfully
        """
        if tx_id not in self.pending_cross_shard_txs:
            print(f"Error: Cross-shard transaction {tx_id} not found")
            return False
        
        cross_shard_tx = self.pending_cross_shard_txs[tx_id]
        
        if cross_shard_tx.status != CrossShardTransactionStatus.PENDING:
            print(f"Error: Cross-shard transaction {tx_id} is in invalid state")
            return False
        
        # Update transaction status
        cross_shard_tx.status = CrossShardTransactionStatus.COMMITTED
        cross_shard_tx.source_tx_hash = source_tx_hash
        cross_shard_tx.committed_at = datetime.now().isoformat()
        
        # Move to active cross-shard transactions
        self.cross_shard_txs[tx_id] = cross_shard_tx
        del self.pending_cross_shard_txs[tx_id]
        
        print(f"Committed cross-shard transaction {tx_id} on source shard {cross_shard_tx.source_shard_id}")
        return True
    
    def finalize_cross_shard_transaction(self, tx_id: str, target_tx_hash: str) -> bool:
        """
        Finalize a cross-shard transaction on the target shard.
        
        Args:
            tx_id: The ID of the cross-shard transaction
            target_tx_hash: The transaction hash on the target shard
            
        Returns:
            True if the transaction was finalized successfully
        """
        if tx_id not in self.cross_shard_txs:
            print(f"Error: Cross-shard transaction {tx_id} not found")
            return False
        
        cross_shard_tx = self.cross_shard_txs[tx_id]
        
        if cross_shard_tx.status != CrossShardTransactionStatus.COMMITTED:
            print(f"Error: Cross-shard transaction {tx_id} is in invalid state")
            return False
        
        # Update transaction status
        cross_shard_tx.status = CrossShardTransactionStatus.FINALIZED
        cross_shard_tx.target_tx_hash = target_tx_hash
        cross_shard_tx.finalized_at = datetime.now().isoformat()
        
        print(f"Finalized cross-shard transaction {tx_id} on target shard {cross_shard_tx.target_shard_id}")
        return True
    
    def get_shard(self, shard_id: int) -> Optional[Shard]:
        """Get a shard by its ID."""
        return self.shards.get(shard_id)
    
    def get_all_shards(self) -> Dict[int, Shard]:
        """Get all shards."""
        return self.shards.copy()
    
    def get_cross_shard_transaction(self, tx_id: str) -> Optional[CrossShardTransaction]:
        """Get a cross-shard transaction by its ID."""
        # Check both pending and active transactions
        tx = self.cross_shard_txs.get(tx_id)
        if not tx:
            tx = self.pending_cross_shard_txs.get(tx_id)
        return tx
    
    def get_user_transactions(self, user_address: str) -> Dict[str, CrossShardTransaction]:
        """Get all cross-shard transactions for a specific user."""
        all_txs = {**self.cross_shard_txs, **self.pending_cross_shard_txs}
        return {
            tx_id: tx for tx_id, tx in all_txs.items()
            if tx.sender == user_address or tx.recipient == user_address
        }
    
    def update_shard_statistics(self, shard_id: int, block_height: int, block_hash: str):
        """
        Update statistics for a shard.
        
        Args:
            shard_id: The ID of the shard
            block_height: The latest block height
            block_hash: The latest block hash
        """
        if shard_id not in self.shards:
            return
        
        with self.shard_locks[shard_id]:
            shard = self.shards[shard_id]
            shard.last_block_height = block_height
            shard.last_block_hash = block_hash
    
    def start_shard_synchronization(self):
        """Start the shard synchronization thread."""
        if self.is_running:
            print("Shard synchronization already running")
            return
        
        self.is_running = True
        self.sync_thread = threading.Thread(target=self._sync_loop, daemon=True)
        self.sync_thread.start()
        print("Started shard synchronization")
    
    def stop_shard_synchronization(self):
        """Stop the shard synchronization thread."""
        self.is_running = False
        if self.sync_thread:
            self.sync_thread.join()
        print("Stopped shard synchronization")
    
    def _sync_loop(self):
        """Main synchronization loop for shards."""
        while self.is_running:
            try:
                # Check for shards that need synchronization
                for shard_id, shard in self.shards.items():
                    if shard.status == ShardStatus.ACTIVE:
                        # Simulate some sync work
                        time.sleep(0.1)
                
                # Sleep for a short interval
                time.sleep(5)
                
            except Exception as e:
                print(f"Error in sync loop: {e}")
                time.sleep(10)
    
    def get_shard_load_distribution(self) -> Dict[int, float]:
        """
        Get the load distribution across shards.
        
        Returns:
            Dictionary mapping shard IDs to load percentages
        """
        total_txs = sum(shard.total_transactions for shard in self.shards.values())
        
        if total_txs == 0:
            return {shard_id: 0.0 for shard_id in self.shards}
        
        load_distribution = {}
        for shard_id, shard in self.shards.items():
            load_percentage = (shard.total_transactions / total_txs) * 100
            load_distribution[shard_id] = round(load_percentage, 2)
        
        return load_distribution
    
    def rebalance_shards(self) -> bool:
        """
        Rebalance shards if load distribution is uneven.
        
        Returns:
            True if rebalancing was performed
        """
        load_distribution = self.get_shard_load_distribution()
        
        # Check if any shard has more than 60% of the load
        max_load = max(load_distribution.values())
        if max_load < 60.0:
            print("Shards are reasonably balanced")
            return False
        
        print("Shards are unbalanced, initiating rebalancing...")
        
        # Find the most loaded and least loaded shards
        most_loaded_shard = max(load_distribution.items(), key=lambda x: x[1])[0]
        least_loaded_shard = min(load_distribution.items(), key=lambda x: x[1])[0]
        
        print(f"Rebalancing from shard {most_loaded_shard} to shard {least_loaded_shard}")
        
        # In a real implementation, this would involve:
        # 1. Moving some accounts from the loaded shard to the less loaded one
        # 2. Updating the sharding function
        # 3. Migrating relevant transactions
        
        # For this MVP, we'll just log the action
        return True
    
    def get_network_statistics(self) -> Dict[str, Any]:
        """Get overall network statistics."""
        total_txs = sum(shard.total_transactions for shard in self.shards.values())
        total_value = sum(shard.total_value for shard in self.shards.values())
        active_shards = sum(1 for shard in self.shards.values() if shard.status == ShardStatus.ACTIVE)
        
        return {
            "total_shards": self.total_shards,
            "active_shards": active_shards,
            "total_transactions": total_txs,
            "total_value": total_value,
            "pending_cross_shard_txs": len(self.pending_cross_shard_txs),
            "active_cross_shard_txs": len(self.cross_shard_txs),
            "load_distribution": self.get_shard_load_distribution()
        }
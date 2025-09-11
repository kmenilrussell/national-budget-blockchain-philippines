from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Any
from datetime import datetime
import hashlib
import math

@dataclass
class UTXO:
    """Represents an Unspent Transaction Output."""
    tx_id: str
    output_index: int
    amount: int
    owner: str
    is_spent: bool = False
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    spent_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        """Validate UTXO parameters after initialization."""
        if self.amount <= 0:
            raise ValueError("UTXO amount must be positive")
        if self.output_index < 0:
            raise ValueError("UTXO output index must be non-negative")

    @property
    def utxo_id(self) -> str:
        """Get the unique identifier for this UTXO."""
        return f"{self.tx_id}:{self.output_index}"

    def to_dict(self) -> Dict[str, Any]:
        """Convert UTXO to dictionary for serialization."""
        return {
            "tx_id": self.tx_id,
            "output_index": self.output_index,
            "amount": self.amount,
            "owner": self.owner,
            "is_spent": self.is_spent,
            "created_at": self.created_at,
            "spent_at": self.spent_at,
            "metadata": self.metadata
        }

class UTXOAccumulator:
    """
    Implements a UTXO accumulator for efficient membership proofs.
    
    The accumulator allows for:
    1. Adding UTXOs to the accumulator
    2. Generating membership proofs for UTXOs
    3. Verifying membership proofs without storing all UTXOs
    4. Efficient batch operations
    """
    
    def __init__(self):
        self.utxos: Dict[str, UTXO] = {}  # utxo_id -> UTXO
        self.accumulator_value = "0" * 64  # Initial accumulator value
        self.hash_function = hashlib.sha256
    
    def add_utxo(self, utxo: UTXO) -> bool:
        """
        Add a UTXO to the accumulator.
        
        Args:
            utxo: The UTXO to add
            
        Returns:
            True if the UTXO was added successfully
        """
        if utxo.utxo_id in self.utxos:
            print(f"Error: UTXO {utxo.utxo_id} already exists")
            return False
        
        # Add to storage
        self.utxos[utxo.utxo_id] = utxo
        
        # Update accumulator
        self._update_accumulator()
        
        print(f"Added UTXO {utxo.utxo_id} to accumulator")
        return True
    
    def spend_utxo(self, utxo_id: str) -> bool:
        """
        Mark a UTXO as spent.
        
        Args:
            utxo_id: The ID of the UTXO to spend
            
        Returns:
            True if the UTXO was spent successfully
        """
        if utxo_id not in self.utxos:
            print(f"Error: UTXO {utxo_id} not found")
            return False
        
        utxo = self.utxos[utxo_id]
        if utxo.is_spent:
            print(f"Error: UTXO {utxo_id} is already spent")
            return False
        
        # Mark as spent
        utxo.is_spent = True
        utxo.spent_at = datetime.now().isoformat()
        
        # Update accumulator
        self._update_accumulator()
        
        print(f"Spent UTXO {utxo_id}")
        return True
    
    def get_utxo(self, utxo_id: str) -> Optional[UTXO]:
        """Get a UTXO by its ID."""
        utxo = self.utxos.get(utxo_id)
        return utxo if utxo and not utxo.is_spent else None
    
    def get_unspent_utxos(self, owner: Optional[str] = None) -> Dict[str, UTXO]:
        """
        Get all unspent UTXOs, optionally filtered by owner.
        
        Args:
            owner: Optional owner address to filter by
            
        Returns:
            Dictionary of unspent UTXOs
        """
        return {
            utxo_id: utxo for utxo_id, utxo in self.utxos.items()
            if not utxo.is_spent and (owner is None or utxo.owner == owner)
        }
    
    def get_balance(self, owner: str) -> int:
        """
        Get the total balance for an owner.
        
        Args:
            owner: The owner address
            
        Returns:
            Total balance of unspent UTXOs
        """
        return sum(utxo.amount for utxo in self.get_unspent_utxos(owner).values())
    
    def generate_membership_proof(self, utxo_id: str) -> Optional[Dict[str, Any]]:
        """
        Generate a membership proof for a UTXO.
        
        Args:
            utxo_id: The ID of the UTXO to prove
            
        Returns:
            A proof dictionary or None if UTXO not found
        """
        if utxo_id not in self.utxos:
            return None
        
        utxo = self.utxos[utxo_id]
        if utxo.is_spent:
            return None
        
        # Create a simple hash-based proof
        # In a real implementation, this would use cryptographic accumulators
        # like RSA accumulators or Merkle accumulators
        
        proof = {
            "utxo_id": utxo_id,
            "utxo_hash": self._hash_utxo(utxo),
            "accumulator_value": self.accumulator_value,
            "witness": self._generate_witness(utxo_id)
        }
        
        return proof
    
    def verify_membership_proof(self, proof: Dict[str, Any]) -> bool:
        """
        Verify a membership proof for a UTXO.
        
        Args:
            proof: The membership proof to verify
            
        Returns:
            True if the proof is valid
        """
        try:
            # Extract proof components
            utxo_id = proof["utxo_id"]
            utxo_hash = proof["utxo_hash"]
            accumulator_value = proof["accumulator_value"]
            witness = proof["witness"]
            
            # Verify accumulator value matches current state
            if accumulator_value != self.accumulator_value:
                return False
            
            # Verify witness
            return self._verify_witness(utxo_id, utxo_hash, witness)
            
        except (KeyError, TypeError):
            return False
    
    def _hash_utxo(self, utxo: UTXO) -> str:
        """Generate a hash for a UTXO."""
        utxo_data = f"{utxo.tx_id}:{utxo.output_index}:{utxo.amount}:{utxo.owner}"
        return self.hash_function(utxo_data.encode()).hexdigest()
    
    def _update_accumulator(self):
        """Update the accumulator value based on current UTXO set."""
        # Get all unspent UTXOs
        unspent_utxos = self.get_unspent_utxos()
        
        # Sort UTXOs by ID for deterministic accumulation
        sorted_utxos = sorted(unspent_utxos.values(), key=lambda u: u.utxo_id)
        
        # Compute accumulator value
        if not sorted_utxos:
            self.accumulator_value = "0" * 64
        else:
            # Simple hash-based accumulation
            accumulator_input = ""
            for utxo in sorted_utxos:
                utxo_hash = self._hash_utxo(utxo)
                accumulator_input += utxo_hash
            
            self.accumulator_value = self.hash_function(accumulator_input.encode()).hexdigest()
    
    def _generate_witness(self, utxo_id: str) -> List[str]:
        """
        Generate a witness for a UTXO membership proof.
        
        This is a simplified implementation. In a real system,
        this would use proper cryptographic accumulator techniques.
        """
        # Get all unspent UTXOs
        unspent_utxos = self.get_unspent_utxos()
        
        # Remove the target UTXO
        if utxo_id in unspent_utxos:
            del unspent_utxos[utxo_id]
        
        # Sort remaining UTXOs
        sorted_utxos = sorted(unspent_utxos.values(), key=lambda u: u.utxo_id)
        
        # Generate witness hashes
        witness = []
        for utxo in sorted_utxos:
            witness.append(self._hash_utxo(utxo))
        
        return witness
    
    def _verify_witness(self, utxo_id: str, utxo_hash: str, witness: List[str]) -> bool:
        """
        Verify a witness for a UTXO membership proof.
        
        This is a simplified implementation. In a real system,
        this would use proper cryptographic accumulator techniques.
        """
        # Get all unspent UTXOs
        unspent_utxos = self.get_unspent_utxos()
        
        # Verify the target UTXO exists and matches the hash
        if utxo_id not in unspent_utxos:
            return False
        
        target_utxo = unspent_utxos[utxo_id]
        if self._hash_utxo(target_utxo) != utxo_hash:
            return False
        
        # Verify witness contains all other UTXOs
        other_utxos = {k: v for k, v in unspent_utxos.items() if k != utxo_id}
        sorted_other_utxos = sorted(other_utxos.values(), key=lambda u: u.utxo_id)
        
        if len(witness) != len(sorted_other_utxos):
            return False
        
        for i, utxo in enumerate(sorted_other_utxos):
            if self._hash_utxo(utxo) != witness[i]:
                return False
        
        return True
    
    def get_accumulator_info(self) -> Dict[str, Any]:
        """Get information about the accumulator state."""
        unspent_utxos = self.get_unspent_utxos()
        total_utxos = len(unspent_utxos)
        total_value = sum(utxo.amount for utxo in unspent_utxos.values())
        
        return {
            "accumulator_value": self.accumulator_value,
            "total_utxos": total_utxos,
            "total_value": total_value,
            "total_utxos_ever_created": len(self.utxos),
            "spent_utxos": len([u for u in self.utxos.values() if u.is_spent])
        }
    
    def export_utxos(self) -> List[Dict[str, Any]]:
        """Export all UTXOs as a list of dictionaries."""
        return [utxo.to_dict() for utxo in self.utxos.values()]
    
    def import_utxos(self, utxo_data: List[Dict[str, Any]]) -> int:
        """
        Import UTXOs from a list of dictionaries.
        
        Args:
            utxo_data: List of UTXO dictionaries
            
        Returns:
            Number of UTXOs successfully imported
        """
        imported_count = 0
        
        for data in utxo_data:
            try:
                utxo = UTXO(
                    tx_id=data["tx_id"],
                    output_index=data["output_index"],
                    amount=data["amount"],
                    owner=data["owner"],
                    is_spent=data.get("is_spent", False),
                    created_at=data.get("created_at", datetime.now().isoformat()),
                    spent_at=data.get("spent_at"),
                    metadata=data.get("metadata")
                )
                
                if self.add_utxo(utxo):
                    imported_count += 1
                    
            except (KeyError, ValueError) as e:
                print(f"Error importing UTXO: {e}")
                continue
        
        # Update accumulator after all imports
        self._update_accumulator()
        
        return imported_count
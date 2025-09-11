from dataclasses import dataclass
from typing import List

@dataclass
class Validator:
    """Represents a validator node in the blockchain."""
    validator_id: str
    public_key: str
    stake: int = 0
    is_active: bool = True

    def __hash__(self):
        return hash(self.validator_id)

    def __eq__(self, other):
        return self.validator_id == other.validator_id
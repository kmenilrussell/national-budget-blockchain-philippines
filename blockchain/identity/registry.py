from typing import Dict, Optional, List
from blockchain.identity.validator import Validator

class ValidatorRegistry:
    """
    Manages the list of active validators in the blockchain.

    This is a permissioned system, so only registered validators can
    participate in consensus.
    """
    def __init__(self):
        self.validators: Dict[str, Validator] = {}

    def add_validator(self, validator_id: str, public_key: str, stake: int = 0) -> bool:
        """
        Adds a new validator to the registry.
        """
        if validator_id in self.validators:
            print("Validator already exists.")
            return False

        new_validator = Validator(
            validator_id=validator_id,
            public_key=public_key,
            stake=stake
        )
        self.validators[validator_id] = new_validator
        print(f"Validator {validator_id} added to the registry.")
        return True

    def remove_validator(self, validator_id: str) -> bool:
        """
        Removes a validator from the registry.
        """
        if validator_id not in self.validators:
            print("Validator not found.")
            return False

        del self.validators[validator_id]
        print(f"Validator {validator_id} removed.")
        return True

    def get_validator(self, validator_id: str) -> Optional[Validator]:
        """
        Returns a validator object by ID.
        """
        return self.validators.get(validator_id)

    def get_validators(self) -> List[Validator]:
        """
        Returns the list of all active validators.
        """
        return list(self.validators.values())
from typing import List
from blockchain.identity.validator import Validator

class ProposerRotation:
    """
    Implements a round-robin validator rotation for consensus.

    This ensures that each validator gets a turn to propose a new block,
    providing fairness and preventing a single entity from dominating.
    """
    def __init__(self, validators: List[Validator]):
        self.validators = sorted(validators, key=lambda v: v.validator_id)
        self.num_validators = len(self.validators)

    def get_current_proposer(self, block_height: int) -> str:
        """
        Determines the current proposer based on the block height.
        """
        if not self.validators:
            return None

        proposer_index = (block_height - 1) % self.num_validators
        return self.validators[proposer_index].validator_id

    def update_validators(self, new_validators: List[Validator]):
        """
        Updates the list of validators, re-sorting for a consistent rotation.
        """
        self.validators = sorted(new_validators, key=lambda v: v.validator_id)
        self.num_validators = len(self.validators)
from blockchain.core.ledger import Ledger
from blockchain.core.block import Block
from blockchain.identity.registry import ValidatorRegistry

class ConsensusEngine:
    """
    Manages the Proof-of-Authority (PoA) consensus process.

    This engine oversees the proposal, validation, and commitment of blocks
    by authorized validators in a round-robin fashion.
    """
    def __init__(self, ledger: Ledger, validator_registry: ValidatorRegistry):
        self.ledger = ledger
        self.validator_registry = validator_registry

    def run_consensus_round(self, proposer_id: str) -> bool:
        """
        Executes a single consensus round.

        A round consists of:
        1. A validator proposing a new block.
        2. Other validators validating the block.
        3. The block being added to the chain.

        Returns:
        True if the round was successful and a new block was added, False otherwise.
        """
        # Step 1: Proposer creates a new block
        print(f"Validator {proposer_id} is proposing a new block...")
        new_block = self.ledger.propose_new_block(proposer_id)

        if not new_block:
            print("Consensus round failed: No block was proposed.")
            return False

        # Step 2: Other validators validate the block
        # In a real system, this would involve broadcasting the block to all
        # validators, who would then verify it. For this MVP, we assume
        # a successful local verification.
        latest_block = self.ledger.get_latest_block()
        if not self.ledger.add_block(new_block):
            print("Consensus round failed: Block validation failed.")
            return False

        # Step 3: Block is committed
        # The ledger.add_block method already handles state commitment.

        print(f"Consensus round successful. Block committed.")
        return True
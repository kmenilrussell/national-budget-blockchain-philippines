import json
from typing import List, Dict, Any, Optional
from blockchain.core.types import Block, Transaction, BlockHeader
from blockchain.core.block import BlockCreator
from blockchain.core.state import StateManager
from blockchain.core.tx_rules import TransactionValidator
from blockchain.core.hash import hash_block_header, hash_transaction
from blockchain.identity.registry import ValidatorRegistry
from blockchain.consensus.rotation import ProposerRotation

class Ledger:
    """
    Manages the core blockchain logic, including the chain, mempool, and state.
    """
    def __init__(self, genesis_block: Block, validator_registry: ValidatorRegistry):
        self.chain: List[Block] = [genesis_block]
        self.mempool: Dict[str, Transaction] = {}
        self.state_manager = StateManager()
        self.state_manager.commit_block(genesis_block) # Initialize state with genesis
        self.tx_validator = TransactionValidator(self.mempool)
        self.validator_registry = validator_registry
        self.proposer_rotation = ProposerRotation(self.validator_registry.get_validators())

    def get_latest_block(self) -> Block:
        """Returns the last block in the chain."""
        return self.chain[-1]

    def get_block_by_hash(self, block_hash: str) -> Optional[Block]:
        """Finds a block by its hash."""
        for block in self.chain:
            if hash_block_header(block.header) == block_hash:
                return block
        return None

    def add_transaction(self, tx: Transaction) -> bool:
        """
        Adds a new transaction to the mempool for a future block.
        """
        tx_hash = hash_transaction(tx)
        if tx_hash in self.mempool:
            print("Transaction already in mempool.")
            return False

        # We perform a light validation here
        if not self.tx_validator.validate_transaction(tx):
            return False

        self.mempool[tx_hash] = tx
        print(f"Transaction {tx_hash} added to mempool.")
        return True

    def propose_new_block(self, proposer_id: str) -> Optional[Block]:
        """
        A validator proposes a new block from the current mempool.
        """
        if proposer_id != self.proposer_rotation.get_current_proposer(self.get_latest_block().header.nonce + 1):
            print("Not your turn to propose a block.")
            return None

        latest_block = self.get_latest_block()
        transactions_to_include = list(self.mempool.values())

        if not transactions_to_include:
            print("Mempool is empty. Cannot propose a block.")
            return None

        new_block = BlockCreator.create_block(
            prev_block_hash=hash_block_header(latest_block.header),
            transactions=transactions_to_include,
            validator=proposer_id
        )

        # Clear mempool for transactions included in the block
        self.mempool.clear()

        return new_block

    def add_block(self, new_block: Block) -> bool:
        """
        Adds a new, validated block to the chain.
        """
        latest_block = self.get_latest_block()
        if not BlockCreator.is_block_valid(new_block, latest_block):
            print("Failed to add block: Block is not valid.")
            return False

        self.chain.append(new_block)
        self.state_manager.commit_block(new_block)
        print(f"New block #{len(self.chain)} added to the chain.")
        return True

    def get_full_chain(self) -> List[Block]:
        """Returns the entire blockchain."""
        return self.chain

    def get_chain_json(self) -> str:
        """Returns a JSON representation of the chain."""
        chain_list = []
        for block in self.chain:
            block_dict = {
                "header": block.header.__dict__,
                "transactions": [tx.__dict__ for tx in block.transactions]
            }
            chain_list.append(block_dict)
        return json.dumps(chain_list, indent=2)
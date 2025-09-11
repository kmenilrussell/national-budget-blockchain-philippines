import time
from typing import List
from blockchain.core.types import Block, BlockHeader, Transaction
from blockchain.core.hash import hash_block_header, hash_transaction
from blockchain.core.merkle import MerkleTree

class BlockCreator:
    """
    Handles the creation and validation of new blocks.
    """
    @staticmethod
    def create_block(prev_block_hash: str, transactions: List[Transaction], validator: str) -> Block:
        """
        Assembles a new block from a list of transactions.

        Args:
        prev_block_hash: The hash of the previous block.
        transactions: The list of transactions to include.
        validator: The ID or address of the validator proposing the block.

        Returns:
        A new Block object.
        """
        # 1. Get transaction hashes
        tx_hashes = [hash_transaction(tx) for tx in transactions]

        # 2. Build the Merkle tree
        merkle_tree = MerkleTree(tx_hashes)
        merkle_root = merkle_tree.get_merkle_root()

        # 3. Create the block header
        header = BlockHeader(
            prev_hash=prev_block_hash,
            merkle_root=merkle_root,
            timestamp=str(time.time()),
            validator=validator
        )

        # 4. Create the block
        new_block = Block(header=header, transactions=transactions)

        return new_block

    @staticmethod
    def is_block_valid(block: Block, prev_block: Block) -> bool:
        """
        Validates a new block.

        Args:
        block: The new block to validate.
        prev_block: The previous block on the chain.

        Returns:
        True if the block is valid, False otherwise.
        """
        # 1. Check if the block's previous hash matches the previous block's hash
        if block.header.prev_hash != hash_block_header(prev_block.header):
            print("Block validation failed: Previous hash mismatch.")
            return False

        # 2. Verify the Merkle root
        tx_hashes = [hash_transaction(tx) for tx in block.transactions]
        re_calculated_merkle_root = MerkleTree(tx_hashes).get_merkle_root()
        if block.header.merkle_root != re_calculated_merkle_root:
            print("Block validation failed: Merkle root mismatch.")
            return False

        # 3. (Optional) Verify the validator's signature
        # This would be done using public key cryptography.
        # from blockchain.security.crypto import Crypto
        # if not Crypto.verify_signature(block.header.validator, block.header.signature, hash_block_header(block.header)):
        # print("Block validation failed: Invalid validator signature.")
        # return False

        # 4. (Optional) Check for transaction validity within the block
        # This would require checking against the current state
        # from blockchain.core.state import StateManager
        # ...

        print("Block is valid.")
        return True
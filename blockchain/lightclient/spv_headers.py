from typing import List
from blockchain.core.block import Block
from blockchain.core.hash import hash_block_header

class SPVHeaders:
    """
    A simplified version of the blockchain for a light client.

    This module stores only the block headers, allowing a client to
    verify block existence and order without downloading the entire chain.
    """
    def __init__(self, full_chain: List[Block]):
        """
        Initializes the SPV headers from a full blockchain.

        Args:
        full_chain: The complete list of blocks from a full node.
        """
        self.headers: List[dict] = [
            {
                "hash": hash_block_header(block.header),
                "prev_hash": block.header.prev_hash,
                "merkle_root": block.header.merkle_root,
                "timestamp": block.header.timestamp
            }
            for block in full_chain
        ]

    def add_header(self, block: Block):
        """
        Adds a new block header to the light client's chain.

        Args:
        block: The new block to add.
        """
        new_header = {
            "hash": hash_block_header(block.header),
            "prev_hash": block.header.prev_hash,
            "merkle_root": block.header.merkle_root,
            "timestamp": block.header.timestamp
        }
        self.headers.append(new_header)

    def get_latest_header(self) -> dict:
        """
        Returns the most recent block header.
        """
        if not self.headers:
            return None
        return self.headers[-1]

    def verify_merkle_proof(self, tx_hash: str, proof: List[tuple], block_hash: str) -> bool:
        """
        Verifies a Merkle proof against a block header.

        This is a crucial function for a light client. It proves that a
        transaction exists in a block without having the full block data.
        """
        from blockchain.core.merkle import MerkleTree

        # Find the block header to get the Merkle root
        merkle_root = ""
        for header in self.headers:
            if header["hash"] == block_hash:
                merkle_root = header["merkle_root"]
                break

        if not merkle_root:
            print("Error: Block header not found.")
            return False

        return MerkleTree.verify_proof(tx_hash, proof, merkle_root)
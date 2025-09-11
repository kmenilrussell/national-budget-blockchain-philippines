import hashlib

class MerkleTree:
    """
    Implements a Merkle tree to efficiently verify transaction integrity.

    A Merkle tree allows for a quick verification of whether a transaction
    is included in a block without needing to download the entire block.
    """
    def __init__(self, data: list):
        """
        Initializes the Merkle tree with a list of data hashes.
        """
        if not data:
            self.leaves = []
            self.root = None
        else:
            self.leaves = [hashlib.sha256(d.encode()).hexdigest() for d in data]
            self.root = self._build_tree(self.leaves)

    def _build_tree(self, nodes: list) -> str:
        """
        Recursively builds the Merkle tree from the bottom up.
        """
        if len(nodes) == 1:
            return nodes[0]

        if len(nodes) % 2 != 0:
            nodes.append(nodes[-1])

        new_level = []
        for i in range(0, len(nodes), 2):
            combined_hash = hashlib.sha256(
                (nodes[i] + nodes[i+1]).encode()
            ).hexdigest()
            new_level.append(combined_hash)

        return self._build_tree(new_level)

    def get_merkle_root(self) -> str:
        """
        Returns the root hash of the Merkle tree.
        """
        return self.root

    def get_proof(self, data_hash: str) -> list:
        """
        Generates a Merkle proof for a given data hash.

        Args:
        data_hash: The hash of the data item to prove.

        Returns:
        A list of tuples, each containing a hash and a direction ('left' or 'right').
        """
        if data_hash not in self.leaves:
            return None

        proof = []
        index = self.leaves.index(data_hash)

        level = self.leaves
        while len(level) > 1:
            if len(level) % 2 != 0:
                level.append(level[-1])

            is_left = (index % 2 == 0)
            sibling_index = index + 1 if is_left else index - 1
            sibling_hash = level[sibling_index]

            proof.append((sibling_hash, 'right' if is_left else 'left'))

            index = index // 2

            new_level = []
            for i in range(0, len(level), 2):
                combined_hash = hashlib.sha256(
                    (level[i] + level[i+1]).encode()
                ).hexdigest()
                new_level.append(combined_hash)
            level = new_level

        return proof

    @staticmethod
    def verify_proof(data_hash: str, proof: list, root_hash: str) -> bool:
        """
        Verifies a Merkle proof.

        Args:
        data_hash: The hash of the data item to prove.
        proof: The Merkle proof.
        root_hash: The known root hash of the tree.

        Returns:
        True if the proof is valid, False otherwise.
        """
        computed_hash = data_hash
        for sibling_hash, direction in proof:
            if direction == 'left':
                combined_hash = sibling_hash + computed_hash
            else:
                combined_hash = computed_hash + sibling_hash
            computed_hash = hashlib.sha256(combined_hash.encode()).hexdigest()

        return computed_hash == root_hash
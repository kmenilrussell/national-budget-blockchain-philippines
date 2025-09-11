from typing import Dict, Set

class ReplayProtection:
    """
    Protects against replay attacks by tracking transaction nonces.

    A replay attack is when a valid, signed transaction is re-sent to the
    network to be re-processed. Nonces prevent this by ensuring each
    transaction can only be processed once.
    """
    def __init__(self):
        # A simple in-memory storage for nonces per account.
        self.nonces: Dict[str, int] = {}
        # A set to track unique transaction IDs
        self.tx_ids: Set[str] = set()

    def get_next_nonce(self, address: str) -> int:
        """
        Returns the next expected nonce for an address.
        """
        return self.nonces.get(address, 0) + 1

    def is_nonce_valid(self, address: str, nonce: int) -> bool:
        """
        Checks if a transaction's nonce is valid.
        """
        current_nonce = self.nonces.get(address, 0)
        return nonce > current_nonce

    def is_tx_id_unique(self, tx_id: str) -> bool:
        """
        Checks if a transaction ID is unique to prevent replay.
        """
        return tx_id not in self.tx_ids

    def update_nonce(self, address: str, nonce: int) -> bool:
        """
        Updates the nonce for an address.
        """
        if self.is_nonce_valid(address, nonce):
            self.nonces[address] = nonce
            return True
        return False

    def add_tx_id(self, tx_id: str) -> bool:
        """
        Adds a transaction ID to the record.
        """
        if tx_id in self.tx_ids:
            return False
        self.tx_ids.add(tx_id)
        return True
from typing import List, Dict, Any
from blockchain.core.types import Transaction

class TransactionValidator:
    """
    Enforces rules for valid transactions before they are included in a block.
    """
    def __init__(self, mempool: Dict[str, Any]): # Using Any to avoid circular imports
        self.mempool = mempool

    def validate_transaction(self, tx: Transaction) -> bool:
        """
        Performs basic validation on a transaction.

        Args:
        tx: The transaction to validate.

        Returns:
        True if the transaction is valid, False otherwise.
        """
        # Rule 1: Transaction must not be a duplicate in the mempool
        if tx.nonce in [t.nonce for t in self.mempool.values() if t.sender == tx.sender]:
            print("Transaction validation failed: Duplicate nonce (replay attack).")
            return False

        # Rule 2: Check for valid amounts
        if tx.amount <= 0:
            print("Transaction validation failed: Amount must be positive.")
            return False

        # Rule 3: Check for valid sender and recipient addresses (simplified check)
        if not tx.sender or not tx.recipient:
            print("Transaction validation failed: Sender or recipient missing.")
            return False

        # Rule 4: Verify the signature
        # from blockchain.security.crypto import Crypto
        # from blockchain.core.hash import hash_transaction
        # if not Crypto.verify_signature(tx.sender, tx.signature, hash_transaction(tx)):
        # print("Transaction validation failed: Invalid signature.")
        # return False

        # Rule 5: Check against the current state (e.g., sufficient funds)
        # This requires access to the StateManager, which is typically handled
        # in the main ledger logic before broadcasting.

        print("Transaction is valid.")
        return True
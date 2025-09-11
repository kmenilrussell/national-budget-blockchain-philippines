from typing import Dict
from blockchain.core.types import Transaction

class FeePolicy:
    """
    Defines the policy for transaction fees.

    This module determines the fee for a transaction based on its size,
    priority, or other factors. In this MVP, it's a simple flat fee.
    """
    def __init__(self):
        # A simple, flat fee per transaction.
        self.base_fee = 100
        # A higher priority fee for faster inclusion.
        self.priority_fee = 500

    def get_transaction_fee(self, tx: Transaction, priority: bool = False) -> int:
        """
        Calculates the fee for a given transaction.

        Args:
        tx: The transaction object.
        priority: A flag to indicate if a priority fee should be applied.

        Returns:
        The calculated fee amount.
        """
        fee = self.base_fee
        if priority:
            fee += self.priority_fee

        # In a real system, fee could also be based on the transaction size
        # fee_rate = 1 # satoshi/byte
        # fee = len(tx.to_bytes()) * fee_rate

        return fee
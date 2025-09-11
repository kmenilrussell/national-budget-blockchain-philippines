from typing import Dict, Any
from blockchain.core.types import Account, DigitalPublicAsset, Transaction

class StateManager:
    """
    Manages the current state of the blockchain, including accounts and DPAs.

    The state is a snapshot of all account balances and assets, updated
    after each block is committed.
    """
    def __init__(self):
        # A simple in-memory state. In a real system, this would be a database.
        self.accounts: Dict[str, Account] = {}
        self.dpa_registry: Dict[str, DigitalPublicAsset] = {}
        self.total_supply: int = 0

    def get_account(self, address: str) -> Account:
        """
        Returns an account, creating it if it doesn't exist.
        """
        if address not in self.accounts:
            self.accounts[address] = Account(address=address)
        return self.accounts[address]

    def process_transaction(self, tx: Transaction):
        """
        Processes a single transaction and updates the state.

        This is a simplified method that handles different transaction types.
        """
        print(f"Processing transaction from {tx.sender} to {tx.recipient}.")

        if tx.data and tx.data.startswith("issue:"):
            # Handle DPA issuance
            dpa_id = tx.data.split(":")[1]
            new_dpa = DigitalPublicAsset(
                asset_id=dpa_id,
                owner=tx.recipient,
                amount=tx.amount,
                data={"source_tx": tx.sender}
            )
            recipient_account = self.get_account(tx.recipient)
            recipient_account.dpas[dpa_id] = new_dpa
            self.total_supply += tx.amount
            print(f"Issued new DPA '{dpa_id}' to {tx.recipient}.")
        elif tx.data and tx.data.startswith("transfer:"):
            # Handle DPA transfer
            dpa_id = tx.data.split(":")[1]
            sender_account = self.get_account(tx.sender)
            recipient_account = self.get_account(tx.recipient)

            if dpa_id in sender_account.dpas and sender_account.dpas[dpa_id].amount >= tx.amount:
                dpa_to_transfer = sender_account.dpas[dpa_id]
                dpa_to_transfer.amount -= tx.amount

                # Check if recipient already has this DPA
                if dpa_id in recipient_account.dpas:
                    recipient_account.dpas[dpa_id].amount += tx.amount
                else:
                    new_dpa = DigitalPublicAsset(
                        asset_id=dpa_id,
                        owner=tx.recipient,
                        amount=tx.amount,
                        data=dpa_to_transfer.data
                    )
                    recipient_account.dpas[dpa_id] = new_dpa

                print(f"Transferred {tx.amount} of DPA '{dpa_id}' from {tx.sender} to {tx.recipient}.")
            else:
                print(f"Error: Insufficient DPA '{dpa_id}' balance or DPA not found.")
        else:
            # Handle standard currency transfer
            sender_account = self.get_account(tx.sender)
            recipient_account = self.get_account(tx.recipient)

            if sender_account.balance >= tx.amount:
                sender_account.balance -= tx.amount
                recipient_account.balance += tx.amount
                print(f"Transferred {tx.amount} currency from {tx.sender} to {tx.recipient}.")
            else:
                print(f"Error: Insufficient balance for {tx.sender}.")

    def commit_block(self, block: Any): # Using Any to avoid circular imports
        """
        Commits a block by processing all its transactions and updating the state.
        """
        print(f"Committing block {block.header.timestamp} with {len(block.transactions)} transactions.")
        for tx in block.transactions:
            self.process_transaction(tx)
        print("Block committed. State updated.")
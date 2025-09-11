import sys
import json
from typing import Dict, Any

# Import all the necessary modules from your blockchain backend
from blockchain.core.types import Block, BlockHeader, Transaction, DigitalPublicAsset, Account
from blockchain.core.hash import hash_block_header, hash_transaction
from blockchain.core.ledger import Ledger
from blockchain.identity.registry import ValidatorRegistry
from blockchain.consensus.consensus import ConsensusEngine
from blockchain.audit.audit_log import AuditLog
from blockchain.security.crypto import Crypto
from blockchain.otc.orders import OrderBook, Order
from blockchain.otc.matching import OrderMatcher
from blockchain.otc.trades import create_trade_transaction

# --- Placeholder for Mock Data and Initialization ---
# In a real application, you would load this from a persistent database
# and a secure configuration file.
validator_registry = ValidatorRegistry()
validator_registry.add_validator("DBM", Crypto.generate_key_pair()[1], 1000)
validator_registry.add_validator("DICT", Crypto.generate_key_pair()[1], 1000)
validator_registry.add_validator("COA", Crypto.generate_key_pair()[1], 1000)

genesis_tx = Transaction(sender="Genesis", recipient="DBM", amount=1000000, data="Initial budget allocation")
genesis_block_header = BlockHeader(prev_hash="0" * 64, merkle_root="0" * 64, timestamp="1672531200", validator="Genesis")
genesis_block = Block(header=genesis_block_header, transactions=[genesis_tx])

ledger = Ledger(genesis_block, validator_registry)
consensus_engine = ConsensusEngine(ledger, validator_registry)
audit_log = AuditLog()
order_book = OrderBook()
order_matcher = OrderMatcher(order_book)


def handle_get_chain() -> Dict[str, Any]:
    """Handles the 'get_chain' action, returning a JSON representation of the blockchain."""
    return {"chain": json.loads(ledger.get_chain_json())}

def handle_get_latest_block() -> Dict[str, Any]:
    """Handles the 'get_latest_block' action."""
    latest_block = ledger.get_latest_block()
    return {
        "block": {
            "header": latest_block.header.__dict__,
            "transactions": [tx.__dict__ for tx in latest_block.transactions]
        }
    }

def handle_get_block_by_hash(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handles the 'get_block_by_hash' action."""
    block_hash = data.get("hash")
    block = ledger.get_block_by_hash(block_hash)
    if block:
        return {
            "block": {
                "header": block.header.__dict__,
                "transactions": [tx.__dict__ for tx in block.transactions]
            }
        }
    return {"error": "Block not found."}

def handle_add_transaction(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handles the 'add_transaction' action."""
    tx = Transaction(
        sender=data.get("sender"),
        recipient=data.get("recipient"),
        amount=data.get("amount"),
        data=data.get("data")
    )
    if ledger.add_transaction(tx):
        audit_log.log_event("TX_ACCEPTED", {"tx_hash": hash_transaction(tx), "sender": tx.sender, "recipient": tx.recipient})
        return {"status": "success", "message": "Transaction added to mempool."}
    return {"status": "error", "message": "Failed to add transaction."}

def handle_propose_block(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handles the 'propose_block' action, which commits a new block."""
    proposer_id = data.get("proposer_id")
    if consensus_engine.run_consensus_round(proposer_id):
        return {"status": "success", "message": "New block proposed and added to the chain."}
    return {"status": "error", "message": "Failed to propose a block."}

def handle_get_accounts() -> Dict[str, Any]:
    """Handles the 'get_accounts' action."""
    accounts = {address: account.__dict__ for address, account in ledger.state_manager.accounts.items()}
    return {"accounts": accounts}

def handle_get_dpa(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handles the 'get_dpa' action."""
    dpa_id = data.get("dpa_id")
    # This logic would be more complex in a real system to find the DPA
    # For now, we'll just search all accounts
    for account in ledger.state_manager.accounts.values():
        if dpa_id in account.dpas:
            return {"dpa": account.dpas[dpa_id].__dict__}
    return {"error": "DPA not found."}

def handle_add_otc_order(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handles the 'add_otc_order' action."""
    order = order_book.add_order(
        owner=data.get("owner"),
        side=data.get("side"),
        amount=data.get("amount"),
        dpa_id=data.get("dpa_id")
    )
    if order:
        audit_log.log_event("OTC_ORDER_PLACED", {"order_id": order.order_id, "side": order.side, "amount": order.amount})
        return {"status": "success", "message": "OTC order placed.", "order_id": order.order_id}
    return {"status": "error", "message": "Failed to place OTC order."}

def handle_get_otc_orders() -> Dict[str, Any]:
    """Handles the 'get_otc_orders' action."""
    return {"orders": order_book.get_open_orders()}

def handle_match_orders() -> Dict[str, Any]:
    """Handles the 'match_orders' action."""
    # This is a simplified, automated matching process. A real system would
    # be more sophisticated.
    for buy_order in list(order_book.buy_orders.values()):
        matched_trade = order_matcher.find_match(buy_order)
        if matched_trade:
            trade_tx = create_trade_transaction(matched_trade)
            # In a real system, you would submit this transaction to the mempool
            # and wait for it to be included in a block.
            audit_log.log_event("OTC_TRADE_EXECUTED", {"trade_id": matched_trade.trade_id})
            return {"status": "success", "message": "Orders matched and trade executed."}
    return {"status": "error", "message": "No matching orders found."}

# --- Main Entry Point ---
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action provided."}))
        sys.exit(1)

    action = sys.argv[1]
    data = {}
    if len(sys.argv) > 2:
        try:
            data = json.loads(sys.argv[2])
        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid JSON data."}))
            sys.exit(1)

    response = {"error": "Action not found."}

    # Dispatch to the appropriate handler based on the action
    if action == 'get_chain':
        response = handle_get_chain()
    elif action == 'get_latest_block':
        response = handle_get_latest_block()
    elif action == 'get_block_by_hash':
        response = handle_get_block_by_hash(data)
    elif action == 'add_transaction':
        response = handle_add_transaction(data)
    elif action == 'propose_block':
        response = handle_propose_block(data)
    elif action == 'get_accounts':
        response = handle_get_accounts()
    elif action == 'get_dpa':
        response = handle_get_dpa(data)
    elif action == 'add_otc_order':
        response = handle_add_otc_order(data)
    elif action == 'get_otc_orders':
        response = handle_get_otc_orders()
    elif action == 'match_orders':
        response = handle_match_orders()
    else:
        response = {"error": f"Unknown action: {action}"}

    print(json.dumps(response))

from dataclasses import dataclass, field
from typing import Dict, Any, Optional
from datetime import datetime
from blockchain.otc.orders import Order
from blockchain.core.types import Transaction

@dataclass
class Trade:
    """
    Represents an executed trade in the OTC market.
    
    A trade is the result of matching a buy order with a sell order.
    It contains details about the transaction and can be recorded
    on the blockchain for immutability.
    """
    trade_id: str
    buy_order_id: str
    sell_order_id: str
    buyer_id: str
    seller_id: str
    dpa_id: str
    amount: int
    price: int
    total_value: int  # amount * price
    executed_at: str = field(default_factory=lambda: datetime.now().isoformat())
    blockchain_tx_hash: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        """Validate trade parameters after initialization."""
        if self.amount <= 0:
            raise ValueError("Trade amount must be positive")
        if self.price <= 0:
            raise ValueError("Trade price must be positive")
        # Calculate total value if not provided
        if self.total_value == 0:
            self.total_value = self.amount * self.price

    def to_dict(self) -> Dict[str, Any]:
        """Convert trade to dictionary for serialization."""
        return {
            "trade_id": self.trade_id,
            "buy_order_id": self.buy_order_id,
            "sell_order_id": self.sell_order_id,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "dpa_id": self.dpa_id,
            "amount": self.amount,
            "price": self.price,
            "total_value": self.total_value,
            "executed_at": self.executed_at,
            "blockchain_tx_hash": self.blockchain_tx_hash,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Trade':
        """Create trade from dictionary."""
        return cls(
            trade_id=data["trade_id"],
            buy_order_id=data["buy_order_id"],
            sell_order_id=data["sell_order_id"],
            buyer_id=data["buyer_id"],
            seller_id=data["seller_id"],
            dpa_id=data["dpa_id"],
            amount=data["amount"],
            price=data["price"],
            total_value=data["total_value"],
            executed_at=data["executed_at"],
            blockchain_tx_hash=data.get("blockchain_tx_hash"),
            metadata=data.get("metadata")
        )

class TradeExecutor:
    """
    Handles the execution and recording of trades on the blockchain.
    
    This class is responsible for:
    1. Creating trade records from matched orders
    2. Generating blockchain transactions for trade settlement
    3. Recording trade execution metadata
    """
    
    def __init__(self):
        self.trades: Dict[str, Trade] = {}
        self.pending_trades: Dict[str, Trade] = {}
    
    def create_trade(self, buy_order: Order, sell_order: Order, amount: int) -> Trade:
        """
        Create a new trade from matched orders.
        
        Args:
            buy_order: The matched buy order
            sell_order: The matched sell order
            amount: The amount being traded
            
        Returns:
            The created Trade object
        """
        trade_id = f"trade_{datetime.now().timestamp()}_{buy_order.order_id}_{sell_order.order_id}"
        
        trade = Trade(
            trade_id=trade_id,
            buy_order_id=buy_order.order_id,
            sell_order_id=sell_order.order_id,
            buyer_id=buy_order.trader_id,
            seller_id=sell_order.trader_id,
            dpa_id=buy_order.dpa_id,  # Should be the same for both orders
            amount=amount,
            price=sell_order.price,  # Use the sell order price (could be average)
            metadata={
                "buy_order_created": buy_order.created_at,
                "sell_order_created": sell_order.created_at,
                "matching_engine": "basic_price_time"
            }
        )
        
        self.pending_trades[trade_id] = trade
        print(f"Created trade {trade_id}: {amount} units of {buy_order.dpa_id} at {sell_order.price}")
        
        return trade
    
    def generate_settlement_transaction(self, trade: Trade) -> Transaction:
        """
        Generate a blockchain transaction to settle the trade.
        
        This creates a transaction that transfers the DPA from seller to buyer
        and the payment from buyer to seller.
        
        Args:
            trade: The trade to settle
            
        Returns:
            A Transaction object for blockchain settlement
        """
        # Create transaction data indicating this is a trade settlement
        trade_data = f"trade:{trade.trade_id}"
        
        # For DPA transfer: seller -> buyer
        dpa_tx = Transaction(
            sender=trade.seller_id,
            recipient=trade.buyer_id,
            amount=trade.amount,
            data=f"transfer:{trade.dpa_id}",
            nonce=0  # Would be calculated based on sender's current nonce
        )
        
        # For payment: buyer -> seller
        payment_tx = Transaction(
            sender=trade.buyer_id,
            recipient=trade.seller_id,
            amount=trade.total_value,
            data=trade_data,
            nonce=0  # Would be calculated based on sender's current nonce
        )
        
        # In a real implementation, these would be separate transactions
        # or part of a more complex atomic swap mechanism
        # For now, we'll return the payment transaction as the primary one
        return payment_tx
    
    def confirm_trade_settlement(self, trade_id: str, tx_hash: str) -> bool:
        """
        Confirm that a trade has been settled on the blockchain.
        
        Args:
            trade_id: The ID of the trade
            tx_hash: The blockchain transaction hash
            
        Returns:
            True if the trade was confirmed successfully
        """
        if trade_id not in self.pending_trades:
            print(f"Error: Trade {trade_id} not found in pending trades")
            return False
        
        trade = self.pending_trades[trade_id]
        trade.blockchain_tx_hash = tx_hash
        
        # Move from pending to confirmed trades
        self.trades[trade_id] = trade
        del self.pending_trades[trade_id]
        
        print(f"Confirmed trade settlement: {trade_id} with tx hash {tx_hash}")
        return True
    
    def get_trade_history(self, trader_id: Optional[str] = None) -> Dict[str, Trade]:
        """
        Get the history of executed trades.
        
        Args:
            trader_id: Optional filter for specific trader
            
        Returns:
            Dictionary of trades
        """
        if trader_id:
            return {
                trade_id: trade for trade_id, trade in self.trades.items()
                if trade.buyer_id == trader_id or trade.seller_id == trader_id
            }
        return self.trades
    
    def get_pending_trades(self) -> Dict[str, Trade]:
        """
        Get trades that are pending blockchain settlement.
        
        Returns:
            Dictionary of pending trades
        """
        return self.pending_trades
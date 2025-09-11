from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class OrderType(Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(Enum):
    OPEN = "open"
    FILLED = "filled"
    CANCELLED = "cancelled"

@dataclass
class Order:
    """
    Represents an order in the OTC market.
    
    An order is an intent to buy or sell a specific amount of a DPA
    at a specified price or better.
    """
    order_id: str
    trader_id: str
    order_type: OrderType
    dpa_id: str
    amount: int
    price: int  # Price per unit of DPA
    status: OrderStatus = OrderStatus.OPEN
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    filled_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        """Validate order parameters after initialization."""
        if self.amount <= 0:
            raise ValueError("Order amount must be positive")
        if self.price <= 0:
            raise ValueError("Order price must be positive")

    def to_dict(self) -> Dict[str, Any]:
        """Convert order to dictionary for serialization."""
        return {
            "order_id": self.order_id,
            "trader_id": self.trader_id,
            "order_type": self.order_type.value,
            "dpa_id": self.dpa_id,
            "amount": self.amount,
            "price": self.price,
            "status": self.status.value,
            "created_at": self.created_at,
            "filled_at": self.filled_at,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Order':
        """Create order from dictionary."""
        return cls(
            order_id=data["order_id"],
            trader_id=data["trader_id"],
            order_type=OrderType(data["order_type"]),
            dpa_id=data["dpa_id"],
            amount=data["amount"],
            price=data["price"],
            status=OrderStatus(data["status"]),
            created_at=data["created_at"],
            filled_at=data.get("filled_at"),
            metadata=data.get("metadata")
        )
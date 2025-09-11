from typing import List, Optional, Tuple
from blockchain.otc.orders import Order, OrderType, OrderStatus

class OrderMatcher:
    """
    Implements a simple order matching engine for the OTC market.
    
    This matcher uses a basic price-time priority algorithm where:
    - Buy orders match with sell orders at or below the buy price
    - Sell orders match with buy orders at or above the sell price
    - Earlier orders have priority over later orders at the same price
    """
    
    def __init__(self):
        self.buy_orders: List[Order] = []
        self.sell_orders: List[Order] = []
    
    def add_order(self, order: Order) -> bool:
        """
        Add a new order to the order book.
        
        Args:
            order: The order to add
            
        Returns:
            True if the order was added successfully
        """
        if order.status != OrderStatus.OPEN:
            print(f"Error: Cannot add order with status {order.status}")
            return False
        
        if order.order_type == OrderType.BUY:
            self.buy_orders.append(order)
            # Sort buy orders by price (descending) then time (ascending)
            self.buy_orders.sort(key=lambda o: (-o.price, o.created_at))
        else:
            self.sell_orders.append(order)
            # Sort sell orders by price (ascending) then time (ascending)
            self.sell_orders.sort(key=lambda o: (o.price, o.created_at))
        
        print(f"Added {order.order_type.value} order {order.order_id} for {order.amount} units at {order.price}")
        return True
    
    def find_matches(self) -> List[Tuple[Order, Order, int]]:
        """
        Find all possible matches between buy and sell orders.
        
        Returns:
            List of tuples (buy_order, sell_order, match_amount)
        """
        matches = []
        
        for buy_order in self.buy_orders:
            if buy_order.status != OrderStatus.OPEN:
                continue
                
            for sell_order in self.sell_orders:
                if sell_order.status != OrderStatus.OPEN:
                    continue
                    
                # Check if orders match (buy price >= sell price)
                if buy_order.price >= sell_order.price:
                    # Calculate match amount (minimum of available amounts)
                    match_amount = min(buy_order.amount, sell_order.amount)
                    
                    # Additional checks could be added here:
                    # - Same DPA ID
                    # - Sufficient balance
                    # - Trading permissions
                    
                    matches.append((buy_order, sell_order, match_amount))
        
        return matches
    
    def execute_match(self, buy_order: Order, sell_order: Order, amount: int) -> bool:
        """
        Execute a match between two orders.
        
        Args:
            buy_order: The buy order
            sell_order: The sell order
            amount: The amount to trade
            
        Returns:
            True if the match was executed successfully
        """
        if amount <= 0:
            print("Error: Match amount must be positive")
            return False
        
        if buy_order.amount < amount or sell_order.amount < amount:
            print("Error: Insufficient order amount for match")
            return False
        
        # Update order amounts
        buy_order.amount -= amount
        sell_order.amount -= amount
        
        # Mark orders as filled if completely executed
        if buy_order.amount == 0:
            buy_order.status = OrderStatus.FILLED
            buy_order.filled_at = buy_order.created_at  # Simplified timestamp
        
        if sell_order.amount == 0:
            sell_order.status = OrderStatus.FILLED
            sell_order.filled_at = sell_order.created_at  # Simplified timestamp
        
        print(f"Executed match: {amount} units at price {sell_order.price}")
        print(f"Buy order {buy_order.order_id} remaining: {buy_order.amount}")
        print(f"Sell order {sell_order.order_id} remaining: {sell_order.amount}")
        
        return True
    
    def cancel_order(self, order_id: str, trader_id: str) -> bool:
        """
        Cancel an existing order.
        
        Args:
            order_id: The ID of the order to cancel
            trader_id: The ID of the trader requesting cancellation
            
        Returns:
            True if the order was cancelled successfully
        """
        # Search in buy orders
        for order in self.buy_orders:
            if order.order_id == order_id and order.trader_id == trader_id:
                if order.status == OrderStatus.OPEN:
                    order.status = OrderStatus.CANCELLED
                    print(f"Cancelled buy order {order_id}")
                    return True
                else:
                    print(f"Error: Cannot cancel order with status {order.status}")
                    return False
        
        # Search in sell orders
        for order in self.sell_orders:
            if order.order_id == order_id and order.trader_id == trader_id:
                if order.status == OrderStatus.OPEN:
                    order.status = OrderStatus.CANCELLED
                    print(f"Cancelled sell order {order_id}")
                    return True
                else:
                    print(f"Error: Cannot cancel order with status {order.status}")
                    return False
        
        print(f"Error: Order {order_id} not found or trader {trader_id} not authorized")
        return False
    
    def get_order_book(self) -> Dict[str, List[Dict]]:
        """
        Get the current state of the order book.
        
        Returns:
            Dictionary containing buy and sell orders
        """
        return {
            "buy_orders": [order.to_dict() for order in self.buy_orders if order.status == OrderStatus.OPEN],
            "sell_orders": [order.to_dict() for order in self.sell_orders if order.status == OrderStatus.OPEN]
        }
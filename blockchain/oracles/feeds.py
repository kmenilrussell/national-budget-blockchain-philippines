from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from enum import Enum
import threading
import time
import json
import requests

class OracleStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISPUTED = "disputed"

class DataFeedType(Enum):
    PRICE = "price"
    WEATHER = "weather"
    SPORTS = "sports"
    CUSTOM = "custom"

@dataclass
class DataFeed:
    """Represents a data feed provided by an oracle."""
    feed_id: str
    name: str
    feed_type: DataFeedType
    source_url: Optional[str] = None
    update_interval: int = 300  # 5 minutes in seconds
    last_updated: Optional[str] = None
    current_value: Optional[Any] = None
    status: OracleStatus = OracleStatus.ACTIVE
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class OracleNode:
    """Represents an oracle node that provides data feeds."""
    node_id: str
    operator: str
    stake: int = 0
    reputation: float = 0.0
    status: OracleStatus = OracleStatus.ACTIVE
    data_feeds: Dict[str, DataFeed] = field(default_factory=dict)
    last_active: str = field(default_factory=lambda: datetime.now().isoformat())

class OracleManager:
    """
    Manages oracle nodes and data feeds for external data integration.
    
    This class handles:
    1. Registering and managing oracle nodes
    2. Creating and updating data feeds
    3. Fetching data from external sources
    4. Consensus mechanisms for data validation
    """
    
    def __init__(self):
        self.oracle_nodes: Dict[str, OracleNode] = {}
        self.data_feeds: Dict[str, DataFeed] = {}
        self.feed_subscribers: Dict[str, List[Callable]] = {}
        self.update_thread = None
        self.is_running = False
    
    def register_oracle_node(self, node_id: str, operator: str, stake: int = 0) -> OracleNode:
        """
        Register a new oracle node.
        
        Args:
            node_id: Unique identifier for the oracle node
            operator: Address of the node operator
            stake: Amount staked by the operator
            
        Returns:
            The registered OracleNode object
        """
        if node_id in self.oracle_nodes:
            print(f"Error: Oracle node {node_id} already exists")
            return None
        
        oracle_node = OracleNode(
            node_id=node_id,
            operator=operator,
            stake=stake
        )
        
        self.oracle_nodes[node_id] = oracle_node
        print(f"Registered oracle node {node_id} operated by {operator}")
        
        return oracle_node
    
    def create_data_feed(self, feed_id: str, name: str, feed_type: DataFeedType,
                        source_url: Optional[str] = None, update_interval: int = 300,
                        oracle_node_id: Optional[str] = None) -> DataFeed:
        """
        Create a new data feed.
        
        Args:
            feed_id: Unique identifier for the data feed
            name: Human-readable name for the feed
            feed_type: Type of data feed
            source_url: URL to fetch data from
            update_interval: How often to update the feed (seconds)
            oracle_node_id: ID of the oracle node providing this feed
            
        Returns:
            The created DataFeed object
        """
        if feed_id in self.data_feeds:
            print(f"Error: Data feed {feed_id} already exists")
            return None
        
        data_feed = DataFeed(
            feed_id=feed_id,
            name=name,
            feed_type=feed_type,
            source_url=source_url,
            update_interval=update_interval
        )
        
        self.data_feeds[feed_id] = data_feed
        
        # Associate with oracle node if specified
        if oracle_node_id and oracle_node_id in self.oracle_nodes:
            self.oracle_nodes[oracle_node_id].data_feeds[feed_id] = data_feed
        
        print(f"Created data feed {feed_id}: {name}")
        
        return data_feed
    
    def fetch_data_from_source(self, data_feed: DataFeed) -> Optional[Any]:
        """
        Fetch data from the source URL of a data feed.
        
        Args:
            data_feed: The data feed to fetch data for
            
        Returns:
            The fetched data or None if failed
        """
        if not data_feed.source_url:
            print(f"Error: No source URL for feed {data_feed.feed_id}")
            return None
        
        try:
            response = requests.get(data_feed.source_url, timeout=10)
            response.raise_for_status()
            
            # Parse the response based on feed type
            if data_feed.feed_type == DataFeedType.PRICE:
                # Assume JSON response with price data
                data = response.json()
                return self._parse_price_data(data)
            elif data_feed.feed_type == DataFeedType.WEATHER:
                # Assume JSON response with weather data
                data = response.json()
                return self._parse_weather_data(data)
            else:
                # Return raw JSON for custom feeds
                return response.json()
                
        except Exception as e:
            print(f"Error fetching data for feed {data_feed.feed_id}: {e}")
            return None
    
    def _parse_price_data(self, data: Dict[str, Any]) -> Optional[float]:
        """Parse price data from JSON response."""
        # Try common price data fields
        for field in ['price', 'value', 'last', 'close']:
            if field in data:
                try:
                    return float(data[field])
                except (ValueError, TypeError):
                    continue
        return None
    
    def _parse_weather_data(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse weather data from JSON response."""
        # Extract common weather fields
        weather_data = {}
        for field in ['temperature', 'humidity', 'pressure', 'wind_speed']:
            if field in data:
                weather_data[field] = data[field]
        return weather_data if weather_data else None
    
    def update_data_feed(self, feed_id: str) -> bool:
        """
        Update a specific data feed by fetching new data.
        
        Args:
            feed_id: ID of the feed to update
            
        Returns:
            True if the update was successful
        """
        if feed_id not in self.data_feeds:
            print(f"Error: Data feed {feed_id} not found")
            return False
        
        data_feed = self.data_feeds[feed_id]
        
        # Fetch new data
        new_value = self.fetch_data_from_source(data_feed)
        
        if new_value is None:
            print(f"Failed to update data feed {feed_id}")
            return False
        
        # Update the feed
        data_feed.current_value = new_value
        data_feed.last_updated = datetime.now().isoformat()
        
        # Notify subscribers
        self._notify_subscribers(feed_id, new_value)
        
        print(f"Updated data feed {feed_id}: {new_value}")
        return True
    
    def subscribe_to_feed(self, feed_id: str, callback: Callable) -> bool:
        """
        Subscribe to updates for a specific data feed.
        
        Args:
            feed_id: ID of the feed to subscribe to
            callback: Function to call when feed is updated
            
        Returns:
            True if subscription was successful
        """
        if feed_id not in self.data_feeds:
            print(f"Error: Data feed {feed_id} not found")
            return False
        
        if feed_id not in self.feed_subscribers:
            self.feed_subscribers[feed_id] = []
        
        self.feed_subscribers[feed_id].append(callback)
        print(f"Subscribed to data feed {feed_id}")
        
        return True
    
    def _notify_subscribers(self, feed_id: str, value: Any):
        """Notify all subscribers of a feed update."""
        if feed_id in self.feed_subscribers:
            for callback in self.feed_subscribers[feed_id]:
                try:
                    callback(feed_id, value)
                except Exception as e:
                    print(f"Error notifying subscriber for feed {feed_id}: {e}")
    
    def start_automatic_updates(self):
        """Start the automatic update thread."""
        if self.is_running:
            print("Automatic updates already running")
            return
        
        self.is_running = True
        self.update_thread = threading.Thread(target=self._update_loop, daemon=True)
        self.update_thread.start()
        print("Started automatic data feed updates")
    
    def stop_automatic_updates(self):
        """Stop the automatic update thread."""
        self.is_running = False
        if self.update_thread:
            self.update_thread.join()
        print("Stopped automatic data feed updates")
    
    def _update_loop(self):
        """Main update loop for automatic data feed updates."""
        while self.is_running:
            try:
                current_time = datetime.now()
                
                for feed_id, data_feed in self.data_feeds.items():
                    if data_feed.status != OracleStatus.ACTIVE:
                        continue
                    
                    # Check if feed needs updating
                    if data_feed.last_updated:
                        last_update = datetime.fromisoformat(data_feed.last_updated)
                        if current_time - last_update < timedelta(seconds=data_feed.update_interval):
                            continue
                    
                    # Update the feed
                    self.update_data_feed(feed_id)
                
                # Sleep for a short interval
                time.sleep(10)
                
            except Exception as e:
                print(f"Error in update loop: {e}")
                time.sleep(30)  # Wait longer on error
    
    def get_data_feed(self, feed_id: str) -> Optional[DataFeed]:
        """Get a data feed by its ID."""
        return self.data_feeds.get(feed_id)
    
    def get_oracle_node(self, node_id: str) -> Optional[OracleNode]:
        """Get an oracle node by its ID."""
        return self.oracle_nodes.get(node_id)
    
    def get_feeds_by_type(self, feed_type: DataFeedType) -> Dict[str, DataFeed]:
        """Get all data feeds of a specific type."""
        return {
            feed_id: feed for feed_id, feed in self.data_feeds.items()
            if feed.feed_type == feed_type
        }
    
    def get_feed_value(self, feed_id: str) -> Optional[Any]:
        """Get the current value of a data feed."""
        feed = self.get_data_feed(feed_id)
        return feed.current_value if feed else None
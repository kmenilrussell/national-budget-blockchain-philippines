import json
from dataclasses import dataclass
from datetime import datetime
import hashlib
from typing import Dict, Any

@dataclass
class AuditEntry:
    """Represents a single entry in the audit log."""
    timestamp: str
    event_type: str
    data: Dict[str, Any]
    prev_chain_hash: str

class AuditLog:
    """
    An append-only, hash-chained log for recording system events.

    This version is extended to handle new OTC-related events.
    """
    def __init__(self):
        self.log_file = "audit_log.jsonl"
        self.log_chain_hash = "0" * 64 # Initial hash for the chain
        self.load_last_hash()

    def load_last_hash(self):
        """
        Loads the last chain hash from the log file to maintain continuity.
        """
        try:
            with open(self.log_file, "r") as f:
                last_line = f.readlines()[-1]
                entry = json.loads(last_line)
                # Re-calculate the hash of the last entry to ensure integrity
                self.log_chain_hash = self.calculate_entry_hash(entry)
        except (IOError, IndexError, json.JSONDecodeError):
            print("No existing audit log found or file is empty. Starting fresh.")
            self.log_chain_hash = "0" * 64

    def calculate_entry_hash(self, entry: Dict[str, Any]) -> str:
        """
        Calculates the hash of a log entry for the chain.
        """
        entry_string = json.dumps(entry, sort_keys=True)
        return hashlib.sha256(entry_string.encode()).hexdigest()

    def log_event(self, event_type: str, data: Dict[str, Any]):
        """
        Logs a new event to the audit file and updates the chain hash.

        Args:
        event_type: The type of event (e.g., "TX_ACCEPTED", "OTC_ORDER_PLACED").
        data: A dictionary containing event-specific data.
        """
        entry_data = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "data": data,
            "prev_chain_hash": self.log_chain_hash
        }

        entry_json = json.dumps(entry_data)

        with open(self.log_file, "a") as f:
            f.write(entry_json + "\n")

        # The new chain hash is the hash of the newly written entry
        self.log_chain_hash = self.calculate_entry_hash(entry_data)

        print(f"Audit log event '{event_type}' recorded.")

    def get_log_chain_hash(self) -> str:
        """
        Returns the current hash of the audit log chain.
        """
        return self.log_chain_hash

    def export_log(self, file_format: str = "jsonl") -> str:
        """
        Exports the audit log to a specified format.

        Args:
        file_format: The format for export ("jsonl" or "csv").

        Returns:
        A string indicating the result of the export.
        """
        if file_format == "jsonl":
            return f"Log exported to {self.log_file}."
        elif file_format == "csv":
            import csv
            output_file = "audit_log.csv"

            try:
                with open(self.log_file, "r") as jsonl_file, open(output_file, "w", newline="") as csv_file:
                    reader = jsonl_file.readlines()
                    if not reader:
                        return "No data to export."

                    headers = list(json.loads(reader[0]).keys())
                    writer = csv.DictWriter(csv_file, fieldnames=headers)
                    writer.writeheader()

                    for line in reader:
                        writer.writerow(json.loads(line))
                    return f"Log exported to {output_file}."
            except (IOError, json.JSONDecodeError) as e:
                return f"Error exporting log: {e}"
        else:
            return "Unsupported file format."
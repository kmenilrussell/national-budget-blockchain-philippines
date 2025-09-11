import json
from flask import Flask, jsonify, request
from blockchain.lightclient.spv_headers import SPVHeaders
# In a real system, the API would connect to a full node to get data.
# For this MVP, we will use a placeholder full node.

class LightClientAPI:
    """
    A simple Flask API for the light client.

    This API serves block headers and allows for Merkle proof verification.
    """
    def __init__(self, spv_headers: SPVHeaders):
        self.app = Flask(__name__)
        self.spv_headers = spv_headers
        self._setup_routes()

    def _setup_routes(self):
        """
        Defines the API routes for the light client.
        """
        @self.app.route("/headers", methods=["GET"])
        def get_headers():
            return jsonify(self.spv_headers.headers)

        @self.app.route("/headers/latest", methods=["GET"])
        def get_latest_header():
            header = self.spv_headers.get_latest_header()
            if header:
                return jsonify(header)
            return jsonify({"error": "No headers available"}), 404

        @self.app.route("/proof/verify", methods=["POST"])
        def verify_proof():
            data = request.get_json()
            tx_hash = data.get("tx_hash")
            proof = data.get("proof")
            block_hash = data.get("block_hash")

            if not all([tx_hash, proof, block_hash]):
                return jsonify({"error": "Missing required fields"}), 400

            is_valid = self.spv_headers.verify_merkle_proof(tx_hash, proof, block_hash)

            return jsonify({"is_valid": is_valid})

    def run(self):
        """
        Starts the light client API server.
        """
        self.app.run(port=5001, debug=True)
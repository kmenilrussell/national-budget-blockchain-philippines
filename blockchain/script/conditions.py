from typing import List, Union, Any
from blockchain.script.vm import VirtualMachine

class Conditions:
    """
    Defines common transaction conditions that can be evaluated by the VM.

    This module provides pre-defined scripts for various transaction types,
    like standard P2PKH, multisig, and timelocks.
    """
    def __init__(self):
        self.vm = VirtualMachine()

    def p2pkh_script(self, pubkey: str, signature: str) -> List[Union[str, Any]]:
        """
        Creates a Pay-to-Public-Key-Hash (P2PKH) script.

        This is the most common type of transaction, where funds are sent to a
        public key hash and can be spent by providing a matching signature and
        public key.

        Script: [signature] [public_key] OP_DUP OP_HASH160 [pubkey_hash] OP_EQUALVERIFY OP_CHECKSIG
        """
        # Note: This is a simplified version. The actual script would require the pubkey hash.
        return [signature, pubkey, 'OP_CHECKSIG']

    def multisig_script(self, m: int, n: int, pubkeys: List[str], signatures: List[str]) -> List[Union[str, Any]]:
        """
        Creates a multi-signature script.

        Args:
        m: The required number of signatures.
        n: The total number of public keys.
        pubkeys: The list of public keys.
        signatures: The list of signatures.

        Script: [sig1] ... [sigM] [pubkey1] ... [pubkeyN] OP_CHECKMULTISIG
        """
        return signatures + pubkeys + ['OP_CHECKMULTISIG']

    def timelock_script(self, locktime: int, transaction_script: List) -> List[Union[str, Any]]:
        """
        Creates a timelock script that requires a minimum time to pass before
        the transaction can be spent.

        Script: [locktime] OP_CHECKLOCKTIMEVERIFY [transaction_script]
        """
        return [locktime, 'OP_CHECKLOCKTIMEVERIFY'] + transaction_script

    def evaluate_script(self, script: List[Union[str, Any]]) -> bool:
        """
        Evaluates a given script using the VM.
        """
        return self.vm.run(script)
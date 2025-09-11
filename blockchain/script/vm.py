from typing import List, Dict, Any, Union

class VirtualMachine:
    """
    A simple, stack-based virtual machine for executing transaction scripts.

    This VM processes a list of opcodes (operations) to evaluate conditions
    and validate transactions, enabling features like multisig and timelocks.
    """
    def __init__(self):
        self.stack: List[Any] = []
        self.opcodes = {
            # Stack operations
            'OP_DUP': self.op_dup,
            'OP_DROP': self.op_drop,
            'OP_EQUAL': self.op_equal,
            'OP_EQUALVERIFY': self.op_equalverify,

            # Cryptographic operations
            'OP_CHECKSIG': self.op_checksig,

            # Timelock operations
            'OP_CHECKLOCKTIMEVERIFY': self.op_checklocktimeverify,

            # Multi-signature operations
            'OP_CHECKMULTISIG': self.op_checkmultisig
        }

    def run(self, script: List[Union[str, Any]]) -> bool:
        """
        Executes a transaction script.

        Args:
        script: A list of opcodes and data to be executed.

        Returns:
        True if the script executes successfully and the final result is True,
        False otherwise.
        """
        self.stack = []
        try:
            for item in script:
                if isinstance(item, str) and item.startswith('OP_'):
                    opcode = self.opcodes.get(item)
                    if not opcode:
                        print(f"Error: Unknown opcode {item}")
                        return False
                    opcode()
                else:
                    self.stack.append(item)

            # The script is considered valid if the final item on the stack is a truthy value
            return bool(self.stack[-1])
        except IndexError:
            print("Error: Invalid script, stack underflow.")
            return False
        except Exception as e:
            print(f"Error executing script: {e}")
            return False

    # --- Opcode Implementations ---

    def op_dup(self):
        """Duplicates the top item on the stack."""
        if len(self.stack) < 1: raise IndexError
        self.stack.append(self.stack[-1])

    def op_drop(self):
        """Removes the top item from the stack."""
        if len(self.stack) < 1: raise IndexError
        self.stack.pop()

    def op_equal(self):
        """Pushes 1 if the top two items are equal, 0 otherwise."""
        if len(self.stack) < 2: raise IndexError
        item1 = self.stack.pop()
        item2 = self.stack.pop()
        self.stack.append(item1 == item2)

    def op_equalverify(self):
        """Verifies if the top two items are equal, drops them if true."""
        self.op_equal()
        if not self.stack.pop():
            raise Exception("OP_EQUALVERIFY failed.")

    def op_checksig(self):
        """
        Verifies a signature against a message and a public key.

        Stack: [signature, pubkey, message] -> [True/False]
        This is a simplified placeholder. In a real system, the message would
        be the transaction hash.
        """
        if len(self.stack) < 3: raise IndexError
        signature = self.stack.pop()
        pubkey = self.stack.pop()
        message = self.stack.pop()

        # Placeholder for real signature verification
        # from blockchain.security.crypto import Crypto
        # result = Crypto.verify_signature(pubkey, message, signature)

        # For this MVP, we will use a mock check
        result = (signature == "valid_sig")
        self.stack.append(result)

    def op_checklocktimeverify(self):
        """
        Verifies that the current block's locktime is greater than the
        value on the stack.

        Stack: [locktime] -> []
        """
        if len(self.stack) < 1: raise IndexError
        locktime = self.stack.pop()

        # Placeholder for block's locktime
        current_block_time = 1234567890

        if current_block_time < locktime:
            raise Exception("Transaction cannot be executed yet due to timelock.")

    def op_checkmultisig(self):
        """
        Verifies a multi-signature transaction.

        Stack: [n_sigs, sig1, ..., sigN, n_keys, pubkey1, ..., pubkeyN] -> [True/False]
        """
        # This is a simplified placeholder
        if len(self.stack) < 3: raise IndexError

        n_keys = self.stack.pop()
        pubkeys = [self.stack.pop() for _ in range(n_keys)]

        n_sigs = self.stack.pop()
        sigs = [self.stack.pop() for _ in range(n_sigs)]

        # For this MVP, we'll assume a successful check
        self.stack.append(True)
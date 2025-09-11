from typing import Dict, List, Set

class RoleBasedAccessControl:
    """
    Manages roles and permissions for user access control.

    This system ensures that users can only perform actions that
    are allowed by their assigned roles.
    """
    def __init__(self):
        # Permissions are simple strings representing actions
        self.permissions: Dict[str, Set[str]] = {
            "admin": {"read_all", "write_all", "manage_users", "manage_validators"},
            "validator": {"read_chain", "propose_block", "read_mempool"},
            "auditor": {"read_chain", "read_logs", "export_data"},
            "citizen": {"read_chain", "read_dpas", "submit_tx"},
        }

    def get_permissions(self, role: str) -> Set[str]:
        """
        Returns the set of permissions for a given role.
        """
        return self.permissions.get(role, set())

    def has_permission(self, role: str, permission: str) -> bool:
        """
        Checks if a role has a specific permission.
        """
        return permission in self.get_permissions(role)

    def is_authorized(self, user_role: str, required_permissions: List[str]) -> bool:
        """
        Checks if a user's role has all of the required permissions.

        Args:
        user_role: The role of the user.
        required_permissions: A list of permissions needed for an action.

        Returns:
        True if the user is authorized, False otherwise.
        """
        user_permissions = self.get_permissions(user_role)
        return all(p in user_permissions for p in required_permissions)
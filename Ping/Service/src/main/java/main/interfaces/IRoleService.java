package main.interfaces;

import main.users.Enums.RoleType;
import main.users.Role;
import main.users.User;

public interface IRoleService {
    Role createRole(RoleType name);

    void deleteRole(RoleType name);

    User assignRoleToUser(String username, RoleType roleName);

    User removeRoleFromUser(String username, RoleType roleName);
}

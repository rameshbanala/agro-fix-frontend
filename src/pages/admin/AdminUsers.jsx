import { useEffect, useState } from "react";
import { Shield, ShieldOff } from "lucide-react";
import * as usersApi from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const loadUsers = async () => {
    setError("");
    try {
      const data = await usersApi.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    setUpdatingId(targetUser.id);
    try {
      await usersApi.setUserRole(targetUser.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)));
      toast.success(`${targetUser.name} is now ${newRole === "admin" ? "an admin" : "a regular user"}.`);
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-2 sm:px-4 pb-16">
      <h2 className="text-3xl font-bold text-brand-700 mb-8 text-center">User Management</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-brand-100 text-brand-700 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3 text-gray-600">{u.contact || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.role === "admin" ? "bg-accent-100 text-accent-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  {u.id === currentUser?.id ? (
                    <span className="text-xs text-gray-400">You</span>
                  ) : (
                    <Button
                      variant={u.role === "admin" ? "dangerLight" : "secondary"}
                      loading={updatingId === u.id}
                      onClick={() => handleToggleRole(u)}
                    >
                      {u.role === "admin" ? (
                        <>
                          <ShieldOff size={16} /> Revoke Admin
                        </>
                      ) : (
                        <>
                          <Shield size={16} /> Make Admin
                        </>
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

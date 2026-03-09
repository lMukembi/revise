import React from "react";

export const AdminLogin = () => {
  return (
    <div>
      <h2>Exam Bank System</h2>
      <form>
        <input
          type="text"
          name="Reg No"
          maxLength={12}
          required
          placeholder="Enter Reg No."
        />
        <input
          type="text"
          name="password"
          required
          placeholder="Enter password"
        />

        <button>Login</button>
      </form>
    </div>
  );
};

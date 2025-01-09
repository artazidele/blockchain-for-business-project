import React, { useState } from 'react';
import { Admin } from './Admin';

export function AdminLogin() {
  // Track whether the admin is authenticated
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Track user input for username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Handle login form submission
   */
  function handleLoginSubmit(event) {
    event.preventDefault();

    // Check the credentials
    if (username === 'Test' && password === 'Admin') {
      setIsAdminAuthenticated(true);
    } else {
      alert('Invalid credentials. Please try again.');
    }
  }

  // If the user is authenticated, show the Admin page
  if (isAdminAuthenticated) {
    return <Admin />;
  }

  // Otherwise, show the login form
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg border-2 border-coffee_2">
      <h2 className="text-2xl text-center font-semibold mb-6">
        Administrator Login
      </h2>
      <form onSubmit={handleLoginSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Username:
          </label>
          <input
            type="text"
            className="p-2 bg-transparent border-b border-b-coffee_5 w-full"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Password:
          </label>
          <input
            type="password"
            className="p-2 bg-transparent border-b border-b-coffee_5 w-full"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="block w-full bg-white font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg hover:text-white hover:bg-lime-900 hover:border-lime-900"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
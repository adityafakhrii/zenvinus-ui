import React from 'react';
import LoginArea from './login-area';

/** Login page rendering the standalone centered auth view without marketing header/footer clutter. */
const Login = () => (
  <main className="min-h-screen bg-canvas">
    <LoginArea />
  </main>
);

export default Login;

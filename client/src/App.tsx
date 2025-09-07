import React from 'react';
import { Route, Switch } from 'wouter';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Assessment } from './pages/Assessment';

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/assessment/:id" component={Assessment} />
      </Switch>
    </div>
  );
}

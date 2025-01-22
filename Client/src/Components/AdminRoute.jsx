import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Admin from './Admin';

const AdminRoute = ({ element, ...rest }) => {
  const authuser = 1;

  if (authuser !== 1) {
    return <Redirect to="*" />;
  }

  return <Route {...rest} element={element} />;
};

export default AdminRoute;
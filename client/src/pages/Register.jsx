import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/register/RegisterForm';

const Register = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
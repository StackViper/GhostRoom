import AuthForm from '../../components/AuthForm';
import Layout from '../../components/Layout';
import axios from 'axios';

export default function LoginPage() {
  const handleLogin = async (data: any) => {
    try {
      const response = await axios.post('/api/auth/login', data);
      localStorage.setItem('auth_token', response.data.session.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center py-12">
        <AuthForm type="login" onSubmit={handleLogin} />
      </div>
    </Layout>
  );
}
